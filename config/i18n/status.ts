import { Language } from "@/types/language";

export type OrderStatus = "WAITING" | "COOKING" | "READY" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUS_TRANSLATIONS: Record<Language, Record<OrderStatus, string>> = {
  th: {
    WAITING: "รอทำ",
    COOKING: "กำลังทำ",
    READY: "พร้อมเสิร์ฟ",
    COMPLETED: "เสร็จแล้ว",
    CANCELLED: "ยกเลิก",
  },
  en: {
    WAITING: "Waiting",
    COOKING: "Cooking",
    READY: "Ready",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  },
};