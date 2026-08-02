import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("auth_token")?.value;
    const selectedStoreId = cookieStore.get("selected_store_id")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = await verifyToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid token payload" }, { status: 401 });
    }

    let member = null;

    // ค้นหาตามร้านที่เลือกไว้จากคุกกี้ก่อน (ถ้ามี)
    if (selectedStoreId) {
      member = await db.storeMember.findFirst({
        where: { userId, storeId: selectedStoreId },
        include: { store: true },
      });
    }

    // หากยังไม่มี ให้ดึงร้านแรกที่ผู้ใช้มีสิทธิ์
    if (!member) {
      member = await db.storeMember.findFirst({
        where: { userId },
        include: { store: true },
      });
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    const storeId = member.store.id;

    const totalProducts = await db.product.count({
      where: { storeId },
    });

    const lowStockProducts = await db.product.findMany({
      where: { 
        storeId, 
        stock: { lte: 5 } 
      },
      take: 5,
    });

    const totalCustomers = await db.customer.count({
      where: { storeId },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await db.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: startOfDay },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        storeName: member.store.name,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts,
        totalCustomers,
        todaySales: todayOrders._sum.total || 0,
        todayOrderCount: todayOrders._count.id || 0,
      },
    });

  } catch (error) {
    console.error("Grocery Stats Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}