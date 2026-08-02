"use client";

import { useEffect } from "react";

export default function StoreCookieSetter({ storeId }: { storeId: string }) {
  useEffect(() => {
    if (storeId) {
      document.cookie = `storeId=${storeId}; path=/; max-age=604800; samesite=strict`;
    }
  }, [storeId]);

  return null; // Component นี้ไม่มี UI ทำหน้าที่ฝัง Cookie อย่างเดียว
}