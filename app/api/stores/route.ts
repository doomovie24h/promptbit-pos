import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId?: string;
  id?: string;
  sub?: string;
  user?: {
    id?: string;
  };
}

/**
 * ดึงและตรวจสอบ User ID จาก Authorization Header หรือ Cookies
 */
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  let token = "";

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    const cookieStore = await cookies();
    const possibleCookieNames = [
      "token",
      "auth_token",
      "access_token",
      "session",
      "sessionId",
    ];

    for (const name of possibleCookieNames) {
      const val = cookieStore.get(name)?.value;
      if (val) {
        token = val;
        break;
      }
    }
  }

  if (!token) return null;

  try {
    const payload = (await verifyToken(token)) as JwtPayload | null;
    return (
      payload?.userId ||
      payload?.id ||
      payload?.sub ||
      payload?.user?.id ||
      null
    );
  } catch (err: unknown) {
    console.error("Token verification failed:", err);
    return null;
  }
}

/**
 * GET /api/stores
 * ดึงข้อมูลรายการร้านค้าทั้งหมดของผู้ใช้ที่เข้าสู่ระบบ
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const storeMembers = await db.storeMember.findMany({
      where: { userId },
      include: { store: true },
      orderBy: { store: { createdAt: "desc" } },
    });

    // กำหนด Type : any ให้กับพารามิเตอร์ member เพื่อป้องกัน Build Error
    const stores = storeMembers
      .filter((member: any) => member.store !== null)
      .map((member: any) => ({
        ...member.store,
        role: member.role,
      }));

    return NextResponse.json({ success: true, data: stores });
  } catch (error: unknown) {
    console.error("API GET Stores Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลร้านค้าได้";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores
 * สร้างร้านค้าใหม่พร้อมบันทึกข้อมูลที่อยู่ พิกัด และตั้งค่าระบบชำระเงิน
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      slug,
      businessType,
      address,
      latitude,
      longitude,
      promptpayId,
      bankName,
      accountName,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อร้านค้า" },
        { status: 400 }
      );
    }

    // จัดระเบียบรูปแบบ slug
    let finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!finalSlug) {
      finalSlug = `store-${Date.now()}`;
    }

    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const existingStore = await db.store.findUnique({
      where: { slug: finalSlug },
    });

    if (existingStore) {
      finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // บันทึกข้อมูลร้านค้าลงฐานข้อมูล (แม็พฟิลด์ promptpayId เข้ากับ promptPayNumber)
    const newStore = await db.store.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug: finalSlug,
        businessType: businessType || "grocery",
        address: address?.trim() || null,
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
        promptPayNumber: promptpayId?.trim() || null,
        bankName: bankName?.trim() || null,
        accountName: accountName?.trim() || null,
        members: {
          create: {
            userId: userId,
            role: Role.OWNER,
          },
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "สร้างร้านค้าสำเร็จ",
      data: newStore,
    });

    // กำหนด Cookie storeId สำหรับใช้งานในเซสชันปัจจุบัน
    response.cookies.set({
      name: "storeId",
      value: newStore.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 วัน
    });

    return response;
  } catch (error: unknown) {
    console.error("API POST Store Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างร้านค้า";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}