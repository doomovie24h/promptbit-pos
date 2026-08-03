/**
 * @fileoverview Grocery Dashboard Page - Modern UI Stats
 * @module app/grocery/dashboard/page
 */

"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, AlertTriangle, LayoutDashboard } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-zinc-400 text-sm">
        กำลังโหลดข้อมูล Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#121622] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">ภาพรวมร้านค้า (Dashboard)</h1>
          <p className="text-xs text-zinc-400">สรุปยอดขาย ออเดอร์ และสถานะคลังสินค้าแบบเรียลไทม์</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121622] border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">ยอดขายรวมทั้งหมด</span>
            <span className="text-2xl font-black text-emerald-400">฿{stats.totalSales.toLocaleString()}</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-[#121622] border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">จำนวนออเดอร์ทั้งหมด</span>
            <span className="text-2xl font-black text-blue-400">{stats.totalOrders.toLocaleString()} ออเดอร์</span>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-[#121622] border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">สินค้าใกล้หมดสต็อก</span>
            <span className="text-2xl font-black text-rose-400">{stats.lowStockItems} รายการ</span>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}