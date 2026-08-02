import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";

async function getStoreAndMember(request: Request) {
  const token = await getAuthCookie();
  if (!token) throw new Error("Unauthenticated");

  const payload = await verifyToken(token);
  const userId = payload.userId as string;

  const url = new URL(request.url);
  const queryStoreId = url.searchParams.get("storeId");
  if (queryStoreId) {
    const membership = await db.storeMember.findFirst({
      where: { userId, storeId: queryStoreId },
      include: { store: true },
    });
    if (membership) return membership;
  }

  try {
    const cookieStore = await cookies();
    const activeStoreId = cookieStore.get("storeId")?.value;
    if (activeStoreId) {
      const membership = await db.storeMember.findFirst({
        where: { userId, storeId: activeStoreId },
        include: { store: true },
      });
      if (membership) return membership;
    }
  } catch (error) {
    // ignore
  }

  const member = await db.storeMember.findFirst({
    where: { userId },
    include: { store: true },
  });

  if (!member) throw new Error("Store not found");

  return member;
}

export async function GET(request: Request) {
  try {
    const member = await getStoreAndMember(request);
    const storeId = member.storeId;

    const [
      orderCount,
      customerCount,
      revenue,
      recentOrders,
    ] = await Promise.all([
      db.order.count({
        where: { storeId },
      }),
      db.customer.count({
        where: { storeId },
      }),
      db.payment.aggregate({
        where: {
          storeId,
          status: "PAID",
        },
        _sum: {
          amount: true,
        },
      }),
      db.order.findMany({
        where: { storeId },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
              price: true,
            },
          },
          payments: {
            where: {
              status: "PAID",
            },
            select: {
              amount: true,
            },
          },
        },
      }),
    ]);

    const sales = revenue._sum.amount ?? 0;

    const formattedOrders = recentOrders.map((order) => {
      const total = order.orderItems.reduce(
        (sum, item) => {
          return sum + item.price * item.quantity;
        },
        0
      );

      return {
        id: order.id,
        customer: order.customer?.name ?? "Walk-in",
        total,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        store: {
          id: member.store.id,
          name: member.store.name,
        },
        summary: {
          sales,
          orders: orderCount,
          customers: customerCount,
          profit: 0,
        },
        recentOrders: formattedOrders,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      {
        status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500,
      }
    );
  }
}