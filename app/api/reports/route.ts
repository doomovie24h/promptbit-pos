/**
 * @fileoverview Enterprise API Endpoint for Store Reports & Analytics
 * @module app/api/reports/route
 */

import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const userId = payload.userId as string;

    const member = await db.storeMember.findFirst({ where: { userId } });
    if (!member) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rangeStr = searchParams.get("range") || "7";
    const rangeDays = parseInt(rangeStr, 10) || 7;

    const startDate = new Date();
    if (rangeDays === 1) {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - rangeDays);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await db.order.findMany({
      where: {
        storeId: member.storeId,
        createdAt: {
          gte: startDate,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    const totalOrders = orders.length;
    const productSalesMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    // เพิ่ม Type : any ให้กับ order เพื่อแก้ปัญหา Implicit Any Type Error
    orders.forEach((order: any) => {
      totalRevenue += order.total;
      
      // เพิ่ม Type : any ให้กับ item
      order.orderItems.forEach((item: any) => {
        const productName = item.product?.name || "สินค้าไม่ระบุชื่อ";
        const productId = item.productId;
        if (!productSalesMap[productId]) {
          productSalesMap[productId] = { name: productName, quantity: 0, revenue: 0 };
        }
        productSalesMap[productId].quantity += item.quantity;
        productSalesMap[productId].revenue += item.price * item.quantity;
      });
    });

    const bestSellers = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

    return NextResponse.json({
      success: true,
      data: {
        rangeDays,
        totalRevenue,
        totalOrders,
        bestSellers,
      },
    });
  } catch (error: any) {
    console.error("Reports API critical error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}