/**
 * @fileoverview Enterprise New Product Creation Page
 * @module app/products/new/page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Tag, DollarSign, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { PosShell } from "@/components/layout/pos-shell";
import { PageHeader } from "@/components/common/page-header";

type Category = {
  id: string;
  name: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json();
        if (res.ok && json.success) {
          setCategories(json.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    void loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("กรุณากรอกชื่อสินค้าและราคาให้ครบถ้วน");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          categoryId: categoryId || null,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        toast.error(json.message ?? "ไม่สามารถสร้างสินค้าได้");
        return;
      }

      toast.success("เพิ่มสินค้าใหม่สำเร็จ!");
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Create product error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PosShell>
      <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <Link
            href="/products"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <PageHeader
            title="เพิ่มสินค้าใหม่ (Create Product)"
            description="ลงทะเบียนเมนูหรือสินค้าใหม่เข้าสู่ระบบแคชเชียร์และคลังสินค้า"
          />
        </div>

        <Card className="rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">ข้อมูลสินค้า</h2>
              <p className="text-xs text-muted-foreground">กรอกรายละเอียดสินค้าด้านล่างให้ครบถ้วน</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Tag size={14} /> ชื่อสินค้า *
              </label>
              <input
                type="text"
                placeholder="เช่น ข้าวผัดกุ้ง, โค้กกระป๋อง"
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
                <span>{submitting ? "กำลังบันทึก..." : "บันทึกสินค้า"}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </PosShell>
  );
}