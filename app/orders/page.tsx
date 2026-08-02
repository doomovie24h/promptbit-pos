/**
 * @fileoverview Enterprise Orders Management Page Component
 * @module app/orders/page
 * @description Enterprise-grade order tracking catalog featuring real-time API integrations, resilient error handling, status filtering, and micro-interactions.
 */

"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Eye, 
  Printer, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Database,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { PosShell } from "@/components/layout/pos-shell";
import { PageHeader } from "@/components/common/page-header";

type OrderStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "PREPARING";

type OrderItem = {
  id: string;
  productId?: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
};

type Order = {
  id: string;
  orderNo: string;
  customer?: string | null;
  total: number;
  paymentMethod?: string | null;
  status: OrderStatus;
  createdAt: string;
  items?: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function loadOrders(manual = false) {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        toast.error(json.message ?? "Failed to load orders");
        return;
      }

      setOrders(json.data ?? []);
    } catch (error) {
      console.error("Orders loading failed:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      if (manual) {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const orderNo = order.orderNo ?? "";
    const customer = order.customer ?? "";
    const matchesSearch = 
      orderNo.toLowerCase().includes(search.toLowerCase()) || 
      customer.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={13} /> สำเร็จ
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock size={13} /> กำลังปรุง
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={13} /> รอชำระ
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle size={13} /> ยกเลิก
          </span>
        );
      default:
        return null;
    }
  };

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "COMPLETED").length;

  return (
    <PosShell>
      <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <PageHeader
            title="รายการสั่งซื้อ (Orders Management)"
            description="จัดการและตรวจสอบประวัติรายการสั่งซื้อทั้งหมดแบบเรียลไทม์"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadOrders(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:bg-muted active:scale-95"
              title="Synchronize Order Data"
            >
              <RefreshCw
                className={`h-4 w-4 text-muted-foreground transition-transform duration-700 ${
                  refreshing ? "animate-spin" : "hover:rotate-180"
                }`}
              />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ออเดอร์ทั้งหมด
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {totalOrders}
                </h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/25 group-hover:scale-105 transition-transform duration-200">
                <Database size={24} className="animate-pulse" />
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ออเดอร์ที่สำเร็จแล้ว
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {completedOrders}
                </h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
                <CheckCircle2 size={24} className="animate-bounce" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ออเดอร์ หรือชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="COMPLETED">สำเร็จ</option>
            <option value="PREPARING">กำลังปรุง</option>
            <option value="PENDING">รอชำระ</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>

        {/* Orders Table Container */}
        <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-semibold text-foreground">ประวัติรายการคำสั่งซื้อ</h2>
              <p className="text-sm text-muted-foreground">
                รายการคำสั่งซื้อทั้งหมดที่บันทึกไว้ในฐานข้อมูลระบบ
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <Database className="h-3.5 w-3.5 animate-pulse text-primary" />
              <span>{filteredOrders.length} รายการแสดงผล</span>
            </span>

          </div>

          {loading ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-sm text-muted-foreground py-20">
              <RefreshCw size={28} className="animate-spin text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider animate-pulse">
                กำลังโหลดข้อมูลออเดอร์...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 text-center py-20">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <AlertCircle size={28} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">ไม่พบรายการสั่งซื้อ</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  ไม่พบออเดอร์ที่ตรงกับเงื่อนไขการค้นหาของคุณในขณะนี้
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">เลขที่ออเดอร์</th>
                      <th className="px-6 py-4">ลูกค้า</th>
                      <th className="px-6 py-4">จำนวนรายการ</th>
                      <th className="px-6 py-4">ยอดรวม</th>
                      <th className="px-6 py-4">วิธีชำระ</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-primary">{order.orderNo}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{order.customer || "ลูกค้าทั่วไป"}</td>
                        <td className="px-6 py-4 text-foreground">{order.items?.length ?? 0} รายการ</td>
                        <td className="px-6 py-4 font-bold text-foreground">฿{Number(order.total).toLocaleString()}</td>
                        <td className="px-6 py-4 text-muted-foreground">{order.paymentMethod || "ไม่ระบุ"}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="ดูรายละเอียด"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                toast.info("ฟังก์ชันพิมพ์ใบเสร็จกำลังพัฒนา");
                              }}
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="พิมพ์ใบเสร็จ"
                            >
                              <Printer size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Order Details Modal (รองรับทั้งโหมดสว่างและโหมดมืดอัตโนมัติ ไม่โปร่งใส และสบายตา) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg rounded-3xl p-6 shadow-2xl bg-card border border-border text-card-foreground space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">รายละเอียดออเดอร์ {selectedOrder.orderNo}</h3>
                  <p className="text-xs text-muted-foreground">เวลาบันทึก: {selectedOrder.createdAt}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ชื่อลูกค้า:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.customer || "ลูกค้าทั่วไป"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">สถานะ:</span>
                  <span>{getStatusBadge(selectedOrder.status)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">วิธีชำระเงิน:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.paymentMethod || "ไม่ระบุ"}</span>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">รายการสินค้าในออเดอร์</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm bg-muted/40 p-2.5 rounded-xl border border-border/50">
                          <span className="text-foreground">{item.product?.name ?? "สินค้า"} x {item.quantity}</span>
                          <span className="font-semibold text-foreground">฿{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">ไม่มีข้อมูลรายการย่อย</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-foreground">ยอดสุทธิรวม:</span>
                  <span className="text-xl font-extrabold text-primary">฿{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </PosShell>
  );
}