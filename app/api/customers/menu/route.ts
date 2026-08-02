import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");

    if (!tableId || typeof tableId !== "string") {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสโต๊ะอาหาร (tableId is required)" },
        { status: 400 }
      );
    }

    const table = await db.diningTable.findUnique({
      where: { id: tableId },
      include: { store: true },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลโต๊ะนี้ในระบบ" },
        { status: 404 }
      );
    }

    const products = await db.product.findMany({
      where: { storeId: table.storeId, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          tableName: table.name,
          storeName: table.store.name,
          products,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer Menu Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการโหลดเมนูสินค้า" },
      { status: 500 }
    );
  }
}