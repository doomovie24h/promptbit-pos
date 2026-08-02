import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export default async function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || cookieStore.get("auth_token")?.value;
  const storeId = cookieStore.get("storeId")?.value;

  if (!token || !storeId) {
    redirect("/stores");
  }

  try {
    const payload: any = await verifyToken(token);
    
    const member = await db.storeMember.findFirst({
      where: { userId: payload.userId, storeId: storeId },
      include: { store: true },
    });

    if (!member) {
      redirect("/stores"); 
    }

    const type = member.store.businessType?.toLowerCase() || "";
    
    // ถ้าไม่ใช่ร้านอาหาร ให้ดีดไปหน้าของตัวเองตามจริง (จะไม่ติดลูปแล้ว)
    if (type.includes("grocery") || type.includes("โชห่วย")) {
      redirect("/grocery");
    }
    if (type.includes("cafe") || type.includes("คาเฟ่")) {
      redirect("/cafe");
    }

  } catch (error: any) {
    // 🛑 สำคัญมาก: ป้องกันไม่ให้ Next.js Redirect Error ถูกจับแล้วพาไปหน้า login ผิดพลาด
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }

    // ถ้าเป็น Error จริงๆ จากฐานข้อมูลหรือ Token พัง ค่อยเตะไปหน้า login
    console.error("🚨 REAL ERROR:", error.message || error);
    redirect("/login");
  }

  return (
    <div className="restaurant-system-wrapper min-h-screen bg-gray-50">
      {children}
    </div>
  );
}