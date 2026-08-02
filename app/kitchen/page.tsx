"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  UtensilsCrossed,
  ArrowRight,
  Flame,
  Eye,
  Printer,
  X,
  FileText,
  User,
  Hash
} from "lucide-react";

type OrderItem = {
  id: string;
  product?: { name: string };
  name?: string;
  quantity: number;
  price: number;
  note?: string;
};

type Order = {
  id: string;
  orderNumber?: string;
  customer?: string | any;
  orderItems: OrderItem[];
  status: string;
  createdAt: string;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const json = await res.json();
      const orderList = Array.isArray(json) ? json : (json.data ?? []);
      setOrders(orderList);
    } catch (error) {
      console.error("Error loading kitchen orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const getNormalizedStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "WAITING" || s === "PENDING") return "pending";
    if (s === "COOKING") return "cooking";
    if (s === "READY") return "ready";
    if (s === "COMPLETED" || s === "DONE") return "completed";
    return "pending";
  };

  const updateOrderStatus = async (id: string, nextStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const json = await res.json();
      if (json.success) {
        fetchOrders();
      } else {
        alert(json.message || "ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrintKitchenTicket = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("กรุณาอนุญาตให้เว็บไซต์เปิดหน้าต่างป๊อปอัปเพื่อพิมพ์งาน");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kitchen Ticket - #${order.orderNumber ?? order.id.slice(0, 6)}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 10px; color: #000; width: 280px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 16px; font-weight: bold; }
            .info { font-size: 12px; margin-bottom: 4px; }
            .item-list { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .item { margin-bottom: 6px; }
            .item-name { font-weight: bold; font-size: 15px; }
            .note { color: #000; font-weight: bold; font-size: 13px; background: #eee; padding: 2px 4px; margin-top: 2px; display: inline-block; }
            .footer { text-align: center; font-size: 11px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KITCHEN ORDER TICKET</div>
            <div class="info">ออเดอร์: #${order.orderNumber ?? order.id.slice(0, 6)}</div>
            <div class="info">เวลา: ${order.createdAt}</div>
            <div class="info">ลูกค้า: ${typeof order.customer === 'string' ? order.customer : (order.customer?.name ?? "ทั่วไป")}</div>
          </div>
          <div class="item-list">
            ${order.orderItems?.map(item => `
              <div class="item">
                <div class="item-name">${item.quantity}x ${item.product?.name ?? item.name ?? "สินค้า"}</div>
                ${item.note ? `<div class="note">หมายเหตุ: ${item.note}</div>` : ""}
              </div>
            `).join('')}
          </div>
          <div class="footer">พิมพ์จากระบบ Promptbit POS</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const pendingOrders = orders.filter((o) => getNormalizedStatus(o.status) === "pending");
  const cookingOrders = orders.filter((o) => getNormalizedStatus(o.status) === "cooking");
  const readyOrders = orders.filter((o) => getNormalizedStatus(o.status) === "ready");

  const hasOrderNote = (order: Order) => {
    return order.orderItems?.some((item) => item.note && item.note.trim() !== "");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">ระบบหน้าครัว (Kitchen Display System)</h1>
            <p className="text-[11px] text-muted-foreground">จัดการและติดตามคิวอาหารแบบเรียลไทม์</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border bg-card hover:bg-muted text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col h-full rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-amber-500/5 text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertCircle size={15} />
              <span>รอทำอาหาร (New Orders)</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
              {pendingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs">
                <UtensilsCrossed size={32} className="mb-2 opacity-30" />
                ไม่มีออเดอร์ใหม่ในขณะนี้
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  hasNote={hasOrderNote(order)}
                  updating={updatingId === order.id}
                  onViewDetails={() => setSelectedOrder(order)}
                  onPrint={() => handlePrintKitchenTicket(order)}
                  onAction={() => updateOrderStatus(order.id, "COOKING")}
                  actionLabel="เริ่มทำอาหาร"
                  actionIcon={Flame}
                  actionBg="bg-amber-600 hover:bg-amber-700 text-white"
                />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col h-full rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-500/5 text-blue-700 dark:text-blue-400">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Flame size={15} />
              <span>กำลังทำ (Cooking)</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
              {cookingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {cookingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs">
                <ChefHat size={32} className="mb-2 opacity-30" />
                ไม่มีรายการที่กำลังทำ
              </div>
            ) : (
              cookingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  hasNote={hasOrderNote(order)}
                  updating={updatingId === order.id}
                  onViewDetails={() => setSelectedOrder(order)}
                  onPrint={() => handlePrintKitchenTicket(order)}
                  onAction={() => updateOrderStatus(order.id, "READY")}
                  actionLabel="ทำเสร็จแล้ว (พร้อมเสิร์ฟ)"
                  actionIcon={CheckCircle}
                  actionBg="bg-emerald-600 hover:bg-emerald-700 text-white"
                />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col h-full rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle size={15} />
              <span>พร้อมเสิร์ฟ (Ready)</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs">
                <CheckCircle size={32} className="mb-2 opacity-30" />
                ไม่มีรายการรอเสิร์ฟ
              </div>
            ) : (
              readyOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  hasNote={hasOrderNote(order)}
                  updating={updatingId === order.id}
                  onViewDetails={() => setSelectedOrder(order)}
                  onPrint={() => handlePrintKitchenTicket(order)}
                  onAction={() => updateOrderStatus(order.id, "COMPLETED")}
                  actionLabel="ปิดออเดอร์"
                  actionIcon={ArrowRight}
                  actionBg="bg-slate-800 hover:bg-slate-900 text-white"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-card border shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-wide uppercase text-muted-foreground">รายละเอียดออเดอร์</h3>
                  <p className="text-sm font-bold">#{selectedOrder.orderNumber ?? selectedOrder.id.slice(0, 6)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg bg-muted/40 border text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={14} className="shrink-0" />
                  <span>ลูกค้า: <strong className="text-foreground">{typeof selectedOrder.customer === 'string' ? selectedOrder.customer : (selectedOrder.customer?.name ?? "ลูกค้าทั่วไป")}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground justify-end">
                  <Clock size={14} className="shrink-0" />
                  <span>เวลา: <strong className="text-foreground">{selectedOrder.createdAt}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">รายการอาหารทั้งหมด</h4>
                <div className="border rounded-lg divide-y bg-card overflow-hidden">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col gap-1.5 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold mr-2 text-[11px]">{item.quantity}x</span>
                          {item.product?.name ?? item.name ?? "สินค้า"}
                        </span>
                        <span className="font-bold text-muted-foreground">฿{item.price * item.quantity}</span>
                      </div>
                      {item.note && (
                        <div className="mt-1 flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                          <span className="font-bold shrink-0">หมายเหตุ:</span>
                          <span className="font-medium">{item.note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePrintKitchenTicket(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Printer size={14} />
                <span>พิมพ์ใบครัว</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs cursor-pointer hover:bg-primary/90 transition-all shadow-2xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ 
  order, 
  hasNote,
  updating, 
  onViewDetails,
  onPrint,
  onAction, 
  actionLabel, 
  actionIcon: ActionIcon, 
  actionBg 
}: { 
  order: Order; 
  hasNote: boolean;
  updating: boolean; 
  onViewDetails: () => void;
  onPrint: () => void;
  onAction: () => void; 
  actionLabel: string; 
  actionIcon: any; 
  actionBg: string; 
}) {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl bg-card border shadow-2xs space-y-3 relative transition-all hover:shadow-xs">
      {hasNote && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
            <Eye size={11} />
            <span>มีหมายเหตุ</span>
          </span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between border-b pb-2 pr-18">
          <span className="text-xs font-bold tracking-wide">
            #{order.orderNumber ?? order.id.slice(0, 6)}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock size={11} />
            <span>{order.createdAt}</span>
          </div>
        </div>

        {order.customer && (
          <p className="text-xs font-medium text-muted-foreground truncate">
            ลูกค้า: <span className="font-semibold text-foreground">{typeof order.customer === 'string' ? order.customer : order.customer?.name}</span>
          </p>
        )}

        <div className="space-y-1.5 pt-0.5">
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="flex flex-col text-xs space-y-0.5">
              <span className="font-medium">
                <span className="font-bold text-primary mr-1.5">{item.quantity}x</span> 
                {item.product?.name ?? item.name ?? "สินค้า"}
              </span>
              {item.note && (
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded w-fit border border-amber-500/20">
                  {item.note}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={onViewDetails}
          title="ดูรายละเอียด"
          className="h-8 px-3 rounded-lg border bg-background hover:bg-muted text-xs font-medium flex items-center justify-center cursor-pointer transition-all"
        >
          <Eye size={13} />
        </button>
        <button
          type="button"
          onClick={onPrint}
          title="พิมพ์ใบครัว"
          className="h-8 px-3 rounded-lg border bg-background hover:bg-muted text-xs font-medium flex items-center justify-center cursor-pointer transition-all text-muted-foreground hover:text-foreground"
        >
          <Printer size={13} />
        </button>
        <button
          type="button"
          disabled={updating}
          onClick={onAction}
          className={`flex-1 h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 disabled:opacity-50 cursor-pointer ${actionBg}`}
        >
          <ActionIcon size={13} className={updating ? "animate-spin" : ""} />
          <span>{updating ? "กำลังอัปเดต..." : actionLabel}</span>
        </button>
      </div>
    </div>
  );
}