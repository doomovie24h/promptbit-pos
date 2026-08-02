import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json({ success: false, message: "Store ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // ตั้งค่า Cookie สำหรับร้านที่เลือก
    cookieStore.set("selected_store_id", storeId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // อยู่ได้ 7 วัน
    });

    return NextResponse.json({ success: true, message: "Switched store successfully" });
  } catch (error) {
    console.error("Switch Store Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}