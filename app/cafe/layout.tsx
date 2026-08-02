import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export default async function CafeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || cookieStore.get("auth_token")?.value;
  const storeId = cookieStore.get("storeId")?.value;

  // 1. ถ้าไม่มีคุกกี้ล็อกอิน หรือไม่ได้เลือกร้านค้า เด้งไปหน้าเลือกร้านทันที
  if (!token || !storeId) {
    redirect("/stores");
  }

  try {
    const payload: any = await verifyToken(token);
    
    // 2. เช็คว่าผู้ใช้นี้มีสิทธิ์ในร้านที่เลือกจริงไหม
    const member = await db.storeMember.findFirst({
      where: { userId: payload.userId, storeId: storeId },
      include: { store: true },
    });

    if (!member) {
      redirect("/stores"); 
    }

    const type = member.store.businessType?.toLowerCase() || "";
    
    // 3. ป้องกันไม่ให้ร้านประเภทอื่นหลงเข้ามาในระบบคาเฟ่
    if (type.includes("grocery") || type.includes("โชห่วย")) {
      redirect("/grocery");
    }
    if (type.includes("restaurant") || type.includes("ร้านอาหาร")) {
      redirect("/restaurant");
    }

  } catch (error) {
    // โทเคนมีปัญหา (เช่นหมดอายุ) เตะไปล็อกอิน
    redirect("/login");
  }

  // ถ้าผ่านด่านทั้งหมด แสดงหน้าแดชบอร์ดคาเฟ่ได้
  return (
    <div className="cafe-system-wrapper min-h-screen bg-gray-50">
      {children}
    </div>
  );
}