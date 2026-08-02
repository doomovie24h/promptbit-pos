import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total } = body;

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

    const storeId = member.storeId;

    // ทำธุรกรรมบันทึกออร์เดอร์และตัดสต็อกอัตโนมัติ (กำหนด type : any ให้กับ tx)
    const order = await db.$transaction(async (tx: any) => {
      const orderNumber = `CAFE-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          type: "TAKEAWAY",
          status: "WAITING",
          subtotal: total,
          total: total,
          userId,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              note: `${item.sweetness || ""} ${item.noteText ? `/ ${item.noteText}` : ""}`.trim(),
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // ตัดสต็อกสินค้า
      for (const item of items) {
        await tx.product.updateMany({
          where: { id: item.id, storeId, trackStock: true },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Cafe Order Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกออร์เดอร์" }, { status: 500 });
  }
}