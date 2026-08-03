/**
 * @fileoverview Grocery Dashboard Core Logic
 * @module app/grocery/dashboard/page
 */

"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  lowStockItems: number;
}

export default function GroceryDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalSales: 0, totalOrders: 0, lowStockItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/grocery/stats");
        const data = await res.json();
        setStats({
          totalSales: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          lowStockItems: data.lowStockItems || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>กำลังโหลดข้อมูล Dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh", color: "#000" }}>
      <h1>Dashboard ภาพรวมร้านค้า</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>ยอดขายรวมทั้งหมด</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "green" }}>{stats.totalSales} บาท</p>
        </div>

        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>จำนวนออเดอร์</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "blue" }}>{stats.totalOrders} ออเดอร์</p>
        </div>

        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>สินค้าใกล้หมดสต็อก</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>{stats.lowStockItems} รายการ</p>
        </div>
      </div>
    </div>
  );
}