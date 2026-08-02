/**
 * @fileoverview Products List Page (Enterprise POS)
 * @module app/products/page
 */

"use client";

import { useEffect, useState } from "react";
import { Plus, Package, Layers, RefreshCw, AlertCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { PosShell } from "@/components/layout/pos-shell";
import { PageHeader } from "@/components/common/page-header";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  category?: Category | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }).catch(() => null),
      ]);

      const prodJson = await prodRes.json();
      if (prodRes.ok && prodJson.success) {
        setProducts(prodJson.data ?? []);
      }

      if (catRes && catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data ?? []);
      }
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function deleteProduct(id: string) {
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        toast.error(json.message ?? "ลบสินค้าไม่สำเร็จ");
        return;
      }

      toast.success("ลบสินค้าเรียบร้อยแล้ว");
      void loadData();
    } catch (error) {
      console.error("Delete product failed:", error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  }

  return (
    <PosShell>
      <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <PageHeader
            title="จัดการสินค้า (Product Management)"
            description="เพิ่ม แก้ไข และตรวจสอบรายการสินค้าในร้านของคุณได้อย่างง่ายดาย"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRefreshing(true);
                void loadData();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-muted active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </button>

            {/* Link ไปหน้าเพิ่มสินค้าใหม่ที่โฟลเดอร์ /products/new */}
            <Link
              href="/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มสินค้าใหม่</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">สินค้าทั้งหมด</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">{products.length} รายการ</h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/25">
                <Package size={24} />
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">หมวดหมู่ทั้งหมด</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">{categories.length} หมวดหมู่</h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                <Layers size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Product List Table */}
        <Card className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-semibold text-foreground">รายการสินค้าทั้งหมดในระบบ</h2>
              <p className="text-sm text-muted-foreground">รายการเมนูและสินค้าที่พร้อมใช้งานบนหน้าแคชเชียร์</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <RefreshCw size={28} className="animate-spin text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider">กำลังโหลดข้อมูล...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border bg-muted/20 text-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ยังไม่มีสินค้าในระบบ</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  คลิกปุ่ม &quot;เพิ่มสินค้าใหม่&quot; ด้านบนเพื่อเริ่มต้นสร้างรายการสินค้าแรกของคุณ
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">ชื่อสินค้า</th>
                      <th className="px-6 py-4">หมวดหมู่</th>
                      <th className="px-6 py-4">ราคา</th>
                      <th className="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {item.category?.name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              {item.category.name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">ทั่วไป</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">฿{Number(item.price).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Link ไปหน้าแก้ไขตาม ID ที่โครงสร้าง [id] รองรับ */}
                            <Link
                              href={`/products/${item.id}`}
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="แก้ไขสินค้า"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => deleteProduct(item.id)}
                              className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                              title="ลบสินค้า"
                            >
                              <Trash2 size={18} />
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

      </div>
    </PosShell>
  );
}