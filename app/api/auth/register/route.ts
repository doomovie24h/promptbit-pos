import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "@/lib/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const registerSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await db.user.findFirst({
      where: {
        username: data.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "อีเมลนี้ถูกใช้งานในระบบแล้ว" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        username: data.email,
        password: passwordHash,
      },
    });

    // สร้าง Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // เตรียม Response
    const response = NextResponse.json(
      {
        success: true,
        token: token,
        data: { userId: user.id },
      },
      { status: 201 }
    );

    // [สำคัญ] ฝัง Cookie ทันทีเพื่อให้ Auto-login ทำงานข้ามหน้าได้
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}