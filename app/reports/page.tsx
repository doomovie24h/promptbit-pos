/**
 * @fileoverview Store Reports & Analytics Page (Unified Theme with PosShell & PageHeader)
 * @module app/reports/page
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Package, 
  RefreshCw, 
  ShoppingBag, 
  TrendingUp 
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PosShell } from "@/components/layout/pos-shell";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Card } from "@/components/ui/card";

type BestSeller = {
  name: string;
  quantity: number;
  revenue: number;
};

type ReportData = {
  rangeDays: number;
  totalRevenue: number;
  totalOrders: number;
  bestSellers: BestSeller[];
};

const ranges = [
  { label: "Today", value: "1" },
  { label: "7 Days", value: "7" },
  { label: "15 Days", value: "15" },
  { label: "30 Days", value: "30" },
];

export default function ReportsPage() {
  const [range, setRange] = useState("7");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = useCallback(async (selectedRange: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?range=${selectedRange}`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setReport(json.data);
      }
    } catch (error) {
      console.error("Report loading failed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchReport(range);
  }, [range, fetchReport]);

  return (
    <PosShell>
      <div className="space-y-6">
        {/* Page Header Component */}
        <PageHeader
          {...({
            title: "Reports & Analytics",
            description: "Analyze sales performance and store statistics",
            actions: (
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  void fetchReport(range);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} className={refreshing || loading ? "animate-spin" : ""} />
                <span>รีเฟรช</span>
              </button>
            )
          } as any)}
        />

        {/* Sales Period Filter Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xs font-bold text-foreground">Sales Period</h2>
              <p className="text-[11px] text-muted-foreground">Select report time range</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {ranges.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  className={`rounded-xl px-4 py-2 text-xs font-medium transition cursor-pointer ${
                    range === item.value
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "bg-background border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ReportCard
            title="Total Revenue"
            value={
              report
                ? `฿${report.totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "฿0.00"
            }
            icon={DollarSign}
          />
          <ReportCard
            title="Total Orders"
            value={report ? report.totalOrders.toLocaleString() : "0"}
            icon={ShoppingBag}
          />
          <ReportCard
            title="Report Range"
            value={range === "1" ? "Today" : `${range} Days`}
            icon={Calendar}
          />
        </section>

        {/* Best Sellers Card */}
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <TrendingUp size={18} className="text-primary" />
                Best Sellers
              </h2>
              <p className="text-[11px] text-muted-foreground">Top selling products</p>
            </div>
            <BarChart3 size={20} className="text-muted-foreground" />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-xs text-muted-foreground space-y-2">
                <RefreshCw size={24} className="animate-spin text-primary" />
                <span>Loading report...</span>
              </div>
            ) : !report || report.bestSellers.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background text-xs text-muted-foreground">
                <Package size={28} className="text-muted-foreground" />
                <span>No sales data</span>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-border bg-muted/50 text-muted-foreground font-bold">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {report.bestSellers.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3.5 font-semibold text-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-foreground">
                            {item.name}
                          </td>
                          <td className="px-4 py-3.5 text-center text-muted-foreground">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-primary">
                            ฿
                            {item.revenue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PosShell>
  );
}

function ReportCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof DollarSign;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">{value}</h3>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
        <Icon size={22} />
      </div>
    </div>
  );
}