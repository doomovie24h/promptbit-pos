import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookie";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ค้นหาผู้ใช้ พร้อมดึงข้อมูลร้านค้าผ่านความสัมพันธ์ StoreMember และ Store
    const user = await db.user.findFirst({
      where: {
        username: email,
      },
      include: {
        members: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ตรวจสอบร้านค้าของ User เพื่อแยกเส้นทางตามประเภทธุรกิจ
    const userStore = user.members[0]?.store;
    let redirectTo = "/dashboard"; // ค่าเริ่มต้น

    if (userStore) {
      const bType = userStore.businessType; // เช่น "grocery", "cafe", "restaurant"

      if (bType === "grocery" || bType === "retail") {
        redirectTo = `/grocery/dashboard`;
      } else if (bType === "cafe" || bType === "restaurant") {
        redirectTo = `/restaurant/dashboard`;
      } else {
        redirectTo = `/dashboard`;
      }
    } else {
      // ถ้าบัญชีนี้ยังไม่มีร้านค้า ให้ไปหน้าสร้างร้านค้าก่อน
      redirectTo = "/setup-business";
    }

    const token = await signToken({
      userId: user.id,
      email: user.username,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      redirectTo, // ส่งเส้นทางให้หน้าบ้านนำไปใช้เปลี่ยนหน้า
      data: {
        id: user.id,
        email: user.username,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}