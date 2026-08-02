import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, items, total } = body;

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลออร์เดอร์หรือรายการสินค้าไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const table = await db.diningTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลโต๊ะอาหารในระบบ" },
        { status: 404 }
      );
    }

    // กำหนด Type : any ให้กับ tx เพื่อป้องกัน Type Error
    const order = await db.$transaction(async (tx: any) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${randomNum}`;

      const newOrder = await tx.order.create({
        data: {
          storeId: table.storeId,
          tableId: table.id,
          orderNumber,
          type: "DINE_IN",
          status: "WAITING",
          subtotal: Number(total) || 0,
          total: Number(total) || 0,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.id || null,
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0,
              total: (Number(item.price) || 0) * (Number(item.quantity) || 1),
              note: item.note || "",
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      await tx.diningTable.update({
        where: { id: table.id },
        data: { status: "OCCUPIED" },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Customer Order Creation Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}