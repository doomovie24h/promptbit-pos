import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

interface JwtPayload {
  userId?: string;
  id?: string;
  sub?: string;
  user?: {
    id?: string;
  };
}

async function getUserIdFromRequest(request: Request): Promise<string | null> {
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
    const payload = (await verifyToken(token)) as JwtPayload | null;
    return payload?.userId || payload?.id || payload?.sub || payload?.user?.id || null;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

/**
 * GET /api/business
 * ดึงข้อมูลร้านค้าและเบอร์พร้อมเพย์ปัจจุบันสำหรับหน้า POS
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

    const cookieStore = await cookies();
    const storeId = cookieStore.get("storeId")?.value;

    let store = null;

    // ถ้ามี Cookie storeId ให้หาตาม ID นั้นก่อน
    if (storeId) {
      store = await db.store.findUnique({
        where: { id: storeId },
      });
    }

    // ถ้ายังไม่มี ให้ดึงร้านค้าแรกที่ User คนนี้เป็นสมาชิกอยู่
    if (!store) {
      const storeMember = await db.storeMember.findFirst({
        where: { userId },
        include: { store: true },
        orderBy: { store: { createdAt: "desc" } },
      });
      store = storeMember?.store || null;
    }

    if (!store) {
      return NextResponse.json(
        { success: false, message: "ยังไม่ได้ตั้งค่าร้านค้าหรือเบอร์พร้อมเพย์" },
        { status: 404 }
      );
    }

    // แม็พฟิลด์ promptPayNumber ให้เป็น promptpayId เพื่อให้หน้า POS อ่านค่าได้ถูกต้องตรงกัน
    const businessData = {
      ...store,
      promptpayId: store.promptPayNumber || "",
    };

    return NextResponse.json({
      success: true,
      data: businessData,
    });
  } catch (error: unknown) {
    console.error("API GET Business Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลธุรกิจได้";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}