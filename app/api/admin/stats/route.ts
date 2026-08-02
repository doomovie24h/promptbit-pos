import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

export async function GET() {
  try {
    const totalStores = await db.store.count();

    const allOrders = await db.order.findMany({
      select: { total: true },
    });
    
    // แก้ไขค่าเริ่มต้นของ reduce ให้เป็น 0 เพื่อขจัด Error type 'unknown' และ 'any'
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    const totalTables = await db.diningTable.count();

    const stores = await db.store.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            diningTables: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          metrics: {
            totalStores,
            totalRevenue,
            totalOrders: allOrders.length,
            totalTables,
          },
          stores,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถดึงข้อมูลสถิติแพลตฟอร์มได้" },
      { status: 500 }
    );
  }
}