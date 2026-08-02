/**
 * @fileoverview Enterprise Product Detail & Edit Page
 * @module app/products/[id]/page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Tag, DollarSign, Layers, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { PosShell } from "@/components/layout/pos-shell";
import { PageHeader } from "@/components/common/page-header";

type Category = {
  id: string;
  name: string;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${id}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }).catch(() => null),
        ]);

        const prodJson = await prodRes.json();
        if (!prodRes.ok || !prodJson.success) {
          toast.error("ไม่พบข้อมูลสินค้า");
          router.push("/products");
          return;
        }

        const product = prodJson.data;
        setName(product.name ?? "");
        setPrice(product.price ? String(product.price) : "");
        setCategoryId(product.categoryId ?? "");

        if (catRes && catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("กรุณากรอกชื่อสินค้าและราคาให้ครบถ้วน");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          categoryId: categoryId || null,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        toast.error(json.message ?? "แก้ไขข้อมูลสินค้าไม่สำเร็จ");
        return;
      }

      toast.success("บันทึกการแก้ไขสำเร็จ!");
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("คุณต้องการลบสินค้านี้ออกจากระบบใช่หรือไม่?")) return;

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
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  }

  if (loading) {
    return (
      <PosShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-muted-foreground">
          <RefreshCw size={32} className="animate-spin text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </PosShell>
    );
  }

  return (
    <PosShell>
      <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <PageHeader
              title="แก้ไขข้อมูลสินค้า (Edit Product)"
              description="ปรับปรุงราคา ชื่อเมนู หรือหมวดหมู่สินค้าในระบบ POS"
            />
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition"
          >
            <Trash2 size={16} />
            <span>ลบสินค้า</span>
          </button>
        </div>

        <Card className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">ฟอร์มแก้ไขข้อมูลสินค้า</h2>
              <p className="text-xs text-muted-foreground">รหัสสินค้า ID: {id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Tag size={14} /> ชื่อสินค้า *
              </label>
              <input
                type="text"
                placeholder="ชื่อสินค้า"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <DollarSign size={14} /> ราคาขาย (บาท) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Layers size={14} /> หมวดหมู่สินค้า
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- ไม่ระบุหมวดหมู่ --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
              <Link
                href="/products"
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md hover:opacity-95 transition disabled:opacity-50"
              >
                <Save size={16} />
                <span>{submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </PosShell>
  );
}