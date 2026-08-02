"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const recoveryType = formData.get("recoveryType") as string;
  const recoveryValue = formData.get("recoveryValue") as string;

  if (!username || !password || !recoveryValue) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return { success: false, error: "Username นี้ถูกใช้งานแล้ว" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        recoveryType,
        recoveryValue,
        isVerified: false,
      },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
      },
    });

    console.log(`[PRODUCTION OTP] ส่งรหัส ${otpCode} ไปยัง ${recoveryType}: ${recoveryValue}`);

    return { success: true, userId: user.id, recoveryValue };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล" };
  }
}

export async function verifyOtpAndLogin(userId: string, otpInput: string) {
  try {
    const validOtp = await prisma.otpCode.findFirst({
      where: {
        userId,
        code: otpInput,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validOtp) {
      return { success: false, error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    await prisma.otpCode.deleteMany({ where: { userId } });

    const cookieStore = await cookies();
    cookieStore.set("session_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, error: "การตรวจสอบ OTP ล้มเหลว" };
  }
}

export async function setupBusinessStore(storeName: string, businessType: "cafe" | "grocery") {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "ไม่พบเซสชันผู้ใช้ กรุณาเข้าสู่ระบบใหม่" };
    }

    const slug = storeName.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000);

    const store = await prisma.store.create({
      data: {
        name: storeName,
        slug,
        businessType,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    return { success: true, businessType: store.businessType };
  } catch (error) {
    console.error("Store Setup Error:", error);
    return { success: false, error: "ไม่สามารถสร้างร้านค้าได้" };
  }
}