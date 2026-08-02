import { Language } from "@/types/language";

export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "CASHIER" | "KITCHEN";

export const ROLE_TRANSLATIONS: Record<Language, Record<UserRole, string>> = {
  th: {
    OWNER: "เจ้าของร้าน",
    ADMIN: "ผู้ดูแลระบบ",
    MANAGER: "ผู้จัดการ",
    STAFF: "พนักงาน",
    CASHIER: "แคชเชียร์",
    KITCHEN: "ครัว",
  },
  en: {
    OWNER: "Owner",
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff",
    CASHIER: "Cashier",
    KITCHEN: "Kitchen",
  },
};