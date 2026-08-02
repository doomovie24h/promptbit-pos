import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

// GET: ดึงรายการโต๊ะทั้งหมดของร้าน
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
      member = await db.storeMember.findFirst({ where: { userId } });
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลร้านค้า" }, { status: 404 });
    }

    const tables = await db.diningTable.findMany({
      where: { storeId: member.storeId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error("Get Tables Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ" }, { status: 500 });
  }
}

// POST: เพิ่มโต๊ะใหม่ พร้อมสร้าง QR Code อัตโนมัติ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "กรุณาระบุชื่อหรือหมายเลขโต๊ะ" }, { status: 400 });
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
      member = await db.storeMember.findFirst({ where: { userId } });
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลร้านค้า" }, { status: 404 });
    }

    // สร้าง QR Code เป็น Unique String สำหรับโต๊ะนี้
    const qrCode = `TABLE-${member.storeId}-${Date.now()}`;

    const newTable = await db.diningTable.create({
      data: {
        name,
        qrCode,
        status: "AVAILABLE",
        storeId: member.storeId,
      },
    });

    return NextResponse.json({ success: true, data: newTable });
  } catch (error) {
    console.error("Create Table Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างโต๊ะ" }, { status: 500 });
  }
}