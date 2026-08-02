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

    // ดึงรายการสินค้าเฉพาะร้านที่เลือก
    const products = await db.product.findMany({
      where: { storeId: member.storeId, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Cafe Products Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" }, { status: 500 });
  }
}