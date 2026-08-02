import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getUserIdFromRequest(request: Request) {
  let token = "";

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    const cookieStore = await cookies();
    const possibleCookieNames = ["token", "auth_token", "access_token", "session", "sessionId"];
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
    const payload: any = await verifyToken(token);
    return payload?.userId || payload?.id || payload?.sub || payload?.user?.id || null;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสร้านค้า" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized - กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในร้านค้านี้จริงหรือไม่
    const member = await db.storeMember.findFirst({
      where: {
        userId: userId,
        storeId: storeId,
      },
      include: { store: true },
    });

    if (!member || !member.store) {
      return NextResponse.json({ success: false, message: "คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้" }, { status: 403 });
    }

    // กำหนดเส้นทางตาม businessType
    let redirectUrl = "/grocery/dashboard";
    const storeType = member.store.businessType?.toLowerCase() || "";

    if (storeType.includes("restaurant") || storeType.includes("ร้านอาหาร")) {
      redirectUrl = "/restaurant/dashboard";
    } else if (storeType.includes("cafe") || storeType.includes("คาเฟ่")) {
      redirectUrl = "/cafe/dashboard";
    } else if (storeType.includes("grocery") || storeType.includes("โชห่วย")) {
      redirectUrl = "/grocery/dashboard";
    }

    const response = NextResponse.json({
      success: true,
      message: "เลือกร้านค้าสำเร็จ",
      data: {
        storeId: member.store.id,
        storeName: member.store.name,
        storeType: member.store.businessType,
        redirectUrl,
      },
    });

    // ฝัง Cookie storeId
    response.cookies.set({
      name: "storeId",
      value: storeId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 วัน
    });

    return response;
  } catch (error: any) {
    console.error("Select Store Error:", error);
    return NextResponse.json({ success: false, message: error.message || "เกิดข้อผิดพลาดในการเลือกร้านค้า" }, { status: 500 });
  }
}