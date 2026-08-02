import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

async function getStrictStoreId(request: Request) {
  const token = await getAuthCookie();
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const userId = payload.userId as string;

    const url = new URL(request.url);
    const queryStoreId = url.searchParams.get("storeId");

    // 1. ตรวจสอบจาก URL Query String และเช็คสิทธิ์การเป็นสมาชิกจริง
    if (queryStoreId) {
      const membership = await db.storeMember.findFirst({
        where: { userId, storeId: queryStoreId },
      });
      if (membership) return queryStoreId;
    }

    // 2. ตรวจสอบจาก Cookie และเช็คสิทธิ์การเป็นสมาชิกจริง
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
      // ข้ามหาก Context ของ cookies ยังไม่เปิดใช้งาน
    }

    // 3. ตรวจสอบจำนวนร้านค้าของ User คนนี้
    const userStores = await db.storeMember.findMany({
      where: { userId },
    });

    // ถ้ามีร้านเดียวในสังกัด ให้ใช้ร้านนั้นอัตโนมัติ (ของใครของมันอย่างแท้จริง)
    if (userStores.length === 1) {
      return userStores[0].storeId;
    }

    // ถ้ามีหลายร้านแต่ไม่ได้เลือก ให้คืนค่า null เพื่อบังคับให้เลือกร้านก่อน
    return null;
  } catch (error) {
    console.error("getStrictStoreId error:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const storeId = await getStrictStoreId(request);

    if (!storeId) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Please select a specific store",
      });
    }

    // ดึงเฉพาะหมวดหมู่ของร้านค้านั้น ๆ เท่านั้น (แยกขาด 100%)
    const categories = await db.category.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Categories GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed loading categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const storeId = await getStrictStoreId(request);

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Please select a valid store first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    // เช็คชื่อซ้ำเฉพาะภายในร้านค้านั้น ๆ (ร้านอื่นชื่อซ้ำกันได้ไม่กวนกัน)
    const exists = await db.category.findFirst({
      where: {
        storeId,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Category already exists in this store" },
        { status: 409 }
      );
    }

    // บันทึกข้อมูลผูกกับ storeId นั้นทันที
    const category = await db.category.create({
      data: { name, storeId },
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Create category failed" },
      { status: 500 }
    );
  }
}