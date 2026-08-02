import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "ตะกร้าสินค้าว่างเปล่า" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("auth_token")?.value;
    const selectedStoreId = cookieStore.get("selected_store_id")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    const userId = payload?.userId;

    let member = null;
    if (selectedStoreId) {
      member = await db.storeMember.findFirst({
        where: { userId, storeId: selectedStoreId },
      });
    }

    if (!member) {
      member = await db.storeMember.findFirst({
        where: { userId },
      });
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลร้านค้า" }, { status: 404 });
    }

    let total = 0;
    for (const item of items) {
      total += (item.price || 0) * (item.quantity || 0);
    }

    // กำหนด Type : any ให้กับ tx เพื่อแก้ปัญหา TypeScript Type Error
    const result = await db.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          storeId: member.storeId,
          total: total,
          status: "COMPLETED",
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการชำระเงิน" }, { status: 500 });
  }
}