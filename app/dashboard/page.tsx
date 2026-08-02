"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  DollarSign,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { PosShell } from "@/components/layout/pos-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Card } from "@/components/ui/card";

interface DashboardSummary {
  sales: number;
  orders: number;
  customers: number;
  profit: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
}

interface SalesPoint {
  date: string;
  total: number;
}

interface DashboardApiResponse {
  success: boolean;
  data?: {
    storeName?: string;
    totalProducts?: number;
    todaySales?: number;
    todayOrderCount?: number;
    totalCustomers?: number;
    summary?: DashboardSummary;
    recentOrders?: RecentOrder[];
  };
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    sales: 0,
    orders: 0,
    customers: 0,
    profit: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [salesData, setSalesData] = useState<SalesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        // ดึงข้อมูลจาก API ของโชห่วยโดยตรงเพื่อให้เชื่อมโยงกันสมบูรณ์
        const res = await fetch("/api/grocery/stats", { cache: "no-store" });

        if (res.ok) {
          const json: DashboardApiResponse = await res.json();
          if (json.success && json.data && isMounted) {
            setSummary({
              sales: json.data.todaySales || 0,
              orders: json.data.todayOrderCount || 0,
              customers: json.data.totalCustomers || 0,
              profit: (json.data.todaySales || 0) * 0.3, // คำนวณกำไรเบื้องต้น
            });
            setRecentOrders([]); // อัปเดตรายการล่าสุดตามโครงสร้างโชห่วย
          }
        }
      } catch (error) {
        console.error("Error loading grocery dashboard data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = [
    {
      title: "Sales (ยอดขายวันนี้)",
      value: `฿${summary.sales.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Orders (ออร์เดอร์วันนี้)",
      value: summary.orders.toString(),
      icon: ShoppingBag,
    },
    {
      title: "Customers (ลูกค้าทั้งหมด)",
      value: summary.customers.toString(),
      icon: Users,
    },
    {
      title: "Profit (กำไรประเมิน)",
      value: `฿${summary.profit.toLocaleString()}`,
      icon: TrendingUp,
    },
  ];

  return (
    <PosShell>
      <div className="space-y-8">
        <PageHeader
          title="Grocery Dashboard"
          description="ระบบบริหารจัดการร้านโชห่วยและสรุปผลประกอบการ"
        />

        {/* Mobile Quick Actions */}
        <section className="grid grid-cols-2 gap-4 lg:hidden">
          <Link
            href="/grocery/pos"
            className="flex flex-col gap-3 rounded-3xl bg-primary p-5 text-primary-foreground transition-opacity hover:opacity-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Plus size={22} />
            </div>
            <div>
              <p className="font-semibold">ระบบแคชเชียร์ (POS)</p>
              <p className="text-xs opacity-80">เปิดหน้าขายสินค้า</p>
            </div>
          </Link>

          <Link
            href="/grocery/dashboard"
            className="flex flex-col gap-3 rounded-3xl border bg-card p-5 transition-colors hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="font-semibold">ภาพรวมร้านค้า</p>
              <p className="text-xs text-muted-foreground">จัดการข้อมูลโชห่วย</p>
            </div>
          </Link>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
            />
          ))}
        </section>

        {/* Sales Chart */}
        <Card className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Sales Overview</h2>
              <p className="text-sm text-muted-foreground">ภาพรวมยอดขายร้านโชห่วย</p>
            </div>
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>

          <div className="mt-6 h-[260px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <p>ยอดขายรวมระบบโชห่วยพร้อมเชื่อมต่อเรียบร้อย</p>
                <Link href="/grocery/pos" className="mt-3 text-sm text-primary underline">
                  ไปหน้าขายหน้าร้าน (POS) คลิกที่นี่
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PosShell>
  );
}

function DashboardCard({ title, value, icon: Icon }: DashboardCardProps) {
  return (
    <Card className="rounded-3xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-xl font-bold">{value}</h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={21} />
        </div>
      </div>
    </Card>
  );
}