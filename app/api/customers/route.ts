import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";

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

    const customers = await db.customer.findMany({
      where: { storeId },
      include: { 
        orders: {
          include: {
            orderItems: true,
            payments: true,
          }
        } 
      },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("Fetch customers error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch customers" },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const storeId = await getStoreId(request);
    const body = await request.json();
    const { name, phone } = body;

    const customer = await db.customer.create({
      data: {
        storeId,
        name,
        phone: phone || null,
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create customer" },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}