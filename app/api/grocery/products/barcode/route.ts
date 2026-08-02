import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const barcode = url.searchParams.get("barcode");
    const query = url.searchParams.get("q") || url.searchParams.get("query");
    const limit = url.searchParams.get("limit");

    // 1. ตรวจสอบ Token
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value ||
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload: any = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: "Token ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // 2. ระบุ storeId (อ่านจาก Cookie ร้านที่เลือกอยู่ก่อน ถ้าไม่มีค่อยดึงจาก storeMember)
    let storeId =
      cookieStore.get("active_store_id")?.value ||
      cookieStore.get("storeId")?.value;

    if (!storeId) {
      const member = await db.storeMember.findFirst({
        where: { userId: payload.userId },
        select: { storeId: true },
      });

      if (!member) {
        return NextResponse.json(
          { success: false, message: "ไม่พบข้อมูลร้านค้าของผู้ใช้งาน" },
          { status: 404 }
        );
      }
      storeId = member.storeId;
    }

    // 3. กรณีที่ส่ง barcode มา (สำหรับระบบสแกนเนอร์หน้า POS)
    if (barcode) {
      const product = await db.product.findFirst({
        where: {
          storeId: storeId,
          OR: [{ barcode: barcode }, { sku: barcode }],
        },
        include: {
          category: true, // ดึงข้อมูลหมวดหมู่มาด้วย (ถ้ามี)
        },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: "ไม่พบสินค้าในระบบ" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: product });
    }

    // 4. กรณีไม่ได้ส่ง barcode (ดึงรายการสินค้าทั้งหมดมาแสดงในหน้าสต็อก/คลังสินค้า)
    const whereCondition: any = {
      storeId: storeId,
    };

    // รองรับการพิมพ์ค้นหาด้วยชื่อ, บาร์โค้ด หรือ SKU
    if (query) {
      whereCondition.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ];
    }

    const products = await db.product.findMany({
      where: whereCondition,
      orderBy: {
        id: "desc", // ใช้ id แทน createdAt
      },
      take: limit ? parseInt(limit) : undefined,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}