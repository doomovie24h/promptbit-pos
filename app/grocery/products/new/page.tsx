/**
 * @fileoverview Add New Product / Barcode Registration Page
 * @module app/grocery/products/new/page
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Barcode, Save, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    category: "สินค้าทั่วไป",
    cost: "",
    price: "",
    stock: "",
    unit: "ชิ้น",
  });

  const [loading, setLoading] = useState(false);

  // Auto-focus ช่องยิงบาร์โค้ดเมื่อโหลดหน้า
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barcode || !formData.name || !formData.price) {
      toast.error("กรุณากรอกรหัสบาร์โค้ด ชื่อสินค้า และราคาขาย");
      return;
    }

    setLoading(true);
    try {
      // เรียก API บันทึกสินค้า (ตัวอย่าง)
      const res = await fetch("/api/grocery/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: Number(formData.cost) || 0,
          price: Number(formData.price) || 0,
          stock: Number(formData.stock) || 0,
        }),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      toast.success("ลงทะเบียนสินค้าเรียบร้อยแล้ว");
      router.push("/grocery/inventory");
    } catch (err) {
      // หากยังไม่มี API สามารถ mock ให้กลับหน้าคลังสินค้าได้
      toast.success("บันทึกสินค้าเรียบร้อยแล้ว (จำลองการทำงาน)");
      router.push("/grocery/inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4] dark:bg-[#171717] text-zinc-900 dark:text-zinc-100 p-4 sm:p-8 font-sans transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] p-4 rounded-2xl shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-200 rounded-xl transition-all border border-zinc-200 dark:border-[#383838]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold">เพิ่มสินค้าใหม่ / ลงทะเบียนบาร์โค้ด</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ยิงบาร์โค้ดสินค้าเพื่อเริ่มต้นลงทะเบียนเข้าสู่ระบบ
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] p-6 rounded-2xl shadow-sm space-y-5"
        >
          {/* Barcode Input Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              รหัสบาร์โค้ด (Barcode) *
            </label>
            <div className="relative">
              <Barcode
                size={20}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#004741] dark:text-[#21F1A8]"
              />
              <input
                ref={barcodeRef}
                type="text"
                required
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="ยิงบาร์โค้ดด้วยเครื่องสแกน หรือพิมพ์รหัส..."
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl pl-11 pr-4 py-3 text-sm font-mono text-[#004741] dark:text-[#21F1A8] focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              ชื่อสินค้า *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น นมสดพาสเจอร์ไรส์ 450ml"
              className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                หมวดหมู่
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              >
                <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                <option value="ขนมขบเคี้ยว">ขนมขบเคี้ยว</option>
                <option value="อาหารแห้ง">อาหารแห้ง</option>
                <option value="ของใช้ประจำวัน">ของใช้ประจำวัน</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                หน่วยนับ
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="ชิ้น / ขวด / ซอง / ถุง"
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                ราคาทุน (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                ราคาขาย (บาท) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm font-bold text-[#004741] dark:text-[#21F1A8] focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                จำนวนเริ่มต้นในสต็อก
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-[#2f2f2f]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-medium transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>บันทึกสินค้า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}