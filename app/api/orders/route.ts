/**
 * @fileoverview Enterprise API Endpoint for Orders Management
 * @module app/api/orders/route
 */

import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";

type OrderItemInput = {
  productId?: string;
  id?: string;
  quantity: number;
  price: number;
  note?: string;
};

type CreateOrderBody = {
  customerId?: string | null;
  tableId?: string | null;
  items: OrderItemInput[];
  paymentMethod?: string;
};

async function getStoreId(request: Request) {
  const token = await getAuthCookie();
  if (!token) throw new Error("Unauthenticated");

  const payload = await verifyToken(token);
  const userId = payload.userId as string;

  const url = new URL(request.url);
  const queryStoreId = url.searchParams.get("storeId");
  if (queryStoreId) {
    const membership = await db.storeMember.findFirst({
      where: { userId, storeId: queryStoreId },
    });
    if (membership) return queryStoreId;
  }

  try {
    const cookieStore = await cookies();
    const activeStoreId = cookieStore.get("storeId")?.value;
    if (activeStoreId) {
      const membership = await db.storeMember.findFirst({
        where: { userId, storeId: activeStoreId },
      });
      if (membership) return activeStoreId;
    }
  } catch (error) {
    // ignore
  }

  const member = await db.storeMember.findFirst({ where: { userId } });
  if (!member) throw new Error("Store not found");

  return member.storeId;
}

export async function GET(request: Request) {
  try {
    const storeId = await getStoreId(request);

    const orders = await db.order.findMany({
      where: { storeId },
      include: {
        orderItems: { include: { product: true } },
        customer: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
      ...order,
      customer: order.customer?.name ?? "ลูกค้าทั่วไป",
      paymentMethod: order.payments?.[0]?.method ?? "CASH",
      createdAt: order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-",
    }));

    return NextResponse.json({ success: true, data: formattedOrders });
  } catch (error: any) {
    console.error("Fetch orders critical error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch orders" },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const userId = payload.userId as string;
    const storeId = await getStoreId(request);

    const body = (await request.json()) as CreateOrderBody;
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart empty" }, { status: 400 });
    }

    const subtotal = body.items.reduce(
      (sum: number, item: OrderItemInput) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal; 
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const rawMethod = (body.paymentMethod || "CASH").toUpperCase();
    const validPaymentMethod = ["CASH", "PROMPTPAY", "BANK", "CARD", "QR"].includes(rawMethod) 
      ? rawMethod 
      : "CASH";

    const order = await db.order.create({
      data: {
        orderNumber,
        storeId,
        customerId: body.customerId ?? null,
        tableId: body.tableId ?? null,
        userId: userId,
        subtotal,
        total,
        status: "WAITING",
        orderItems: {
          create: body.items.map((item: OrderItemInput) => ({
            productId: item.productId || item.id || "",
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            note: item.note || null,
          })),
        },
        payments: {
          create: {
            amount: total,
            method: validPaymentMethod as any,
            status: "PAID",
            storeId,
          },
        },
      },
      include: {
        orderItems: { include: { product: true } },
        payments: true,
        customer: true,
      },
    });

    const responseData = {
      ...order,
      customer: order.customer?.name ?? "ลูกค้าทั่วไป",
      paymentMethod: order.payments?.[0]?.method ?? "CASH",
      createdAt: new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Create order failed" },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}