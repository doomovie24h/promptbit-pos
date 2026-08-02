/**
 * @fileoverview Inventory Management Page (Production Ready) - Promptbit POS
 * @module app/grocery/inventory/page
 */

"use client";

import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  price: number;
  cost: number | null;
  stockQuantity: number;
  minStockLevel?: number;
  category?: {
    id: string;
    name: string;
  } | null;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "low_stock">("all");

  // State สำหรับ Modal เพิ่ม/แก้ไขสินค้า
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    price: "",
    cost: "",
    stockQuantity: "",
  });

  // 1. ดึงรายการสินค้าทั้งหมดจาก API จริง (Database)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/grocery/products${queryParam}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "ไม่สามารถดึงข้อมูลสินค้าได้");
      }

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Fetch inventory error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการโหลดคลังสินค้า");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 2. ฟังก์ชันยิง API บันทึกสินค้าลง Database จริง
  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อสินค้า");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("กรุณากรอกราคาขายที่ถูกต้อง");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        barcode: formData.barcode.trim() || null,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0,
      };

      // ยิงไปที่ API สินค้าจริง
      const res = await fetch("/api/grocery/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload
        ),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "บันทึกข้อมูลไม่สำเร็จ");
      }

      toast.success(editingId ? "อัปเดตสินค้าสำเร็จ!" : "เพิ่มสินค้าลงคลังเรียบร้อยแล้ว!");
      setIsModalOpen(false);
      resetForm();
      fetchProducts(); // โหลดรายการสินค้าใหม่ทันที
    } catch (error: any) {
      console.error("Save product error:", error);
      toast.error(error.message || "ไม่สามารถบันทึกสินค้าได้");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. ฟังก์ชันลบสินค้าจริงจาก Database
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${name}" ออกจากคลังใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/grocery/products?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "ลบสินค้าไม่สำเร็จ");
      }

      toast.success("ลบสินค้าเรียบร้อยแล้ว");
      fetchProducts();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || "",
      barcode: p.barcode || "",
      price: p.price ? p.price.toString() : "",
      cost: p.cost ? p.cost.toString() : "",
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity.toString() : "0",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      barcode: "",
      price: "",
      cost: "",
      stockQuantity: "",
    });
  };

  // กรองรายการสินค้า (ใกล้หมดสต็อก)
  const filteredProducts = products.filter((p) => {
    if (filterType === "low_stock") {
      return p.stockQuantity <= (p.minStockLevel || 5);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#171717] text-zinc-100 p-4 md:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2f2f2f] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/grocery/dashboard"
            className="p-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] border border-[#333] text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">จัดการคลังสินค้า & สต็อก</h1>
            <p className="text-xs text-zinc-400">
              ตรวจสอบสต็อกสินค้าคงเหลือ และอัปเดตราคา/จำนวนสินค้าจริง
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#21F1A8] hover:bg-[#1bd495] text-black font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Plus size={18} />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า หรือยิงบาร์โค้ดเพื่อค้นหา..."
            className="w-full bg-[#212121] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterType === "all"
                ? "bg-emerald-500/10 border border-emerald-500 text-emerald-400"
                : "bg-[#212121] border border-[#333] text-zinc-400 hover:text-white"
            }`}
          >
            ทั้งหมด ({products.length})
          </button>
          <button
            onClick={() => setFilterType("low_stock")}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterType === "low_stock"
                ? "bg-amber-500/10 border border-amber-500 text-amber-400"
                : "bg-[#212121] border border-[#333] text-zinc-400 hover:text-white"
            }`}
          >
            <AlertTriangle size={14} />
            <span>ใกล้หมดสต็อก</span>
          </button>
          <button
            onClick={() => fetchProducts()}
            className="p-2 bg-[#212121] border border-[#333] rounded-xl text-zinc-400 hover:text-white transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#212121] border border-[#2f2f2f] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <span className="text-xs">กำลังโหลดข้อมูลคลังสินค้า...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Package size={48} className="stroke-[1.2] text-zinc-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-400">ไม่พบรายการสินค้าในคลัง</p>
              <p className="text-xs text-zinc-600 mt-1">
                สามารถกดปุ่ม "เพิ่มสินค้าใหม่" ด้านบนเพื่อเริ่มบันทึกสินค้าลงระบบจริง
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-[#1a1a1a] text-zinc-400 border-b border-[#2f2f2f] text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">บาร์โค้ด</th>
                  <th className="px-5 py-3.5">ชื่อสินค้า</th>
                  <th className="px-5 py-3.5">หมวดหมู่</th>
                  <th className="px-5 py-3.5 text-right">ราคาทุน</th>
                  <th className="px-5 py-3.5 text-right">ราคาขาย</th>
                  <th className="px-5 py-3.5 text-center">คงเหลือ</th>
                  <th className="px-5 py-3.5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#282828] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">
                      {p.barcode || p.sku || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-zinc-100">{p.name}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      {p.category?.name || "ทั่วไป"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-zinc-400">
                      ฿{(p.cost || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-emerald-400 font-semibold">
                      ฿{(p.price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                          p.stockQuantity <= 5
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {p.stockQuantity} ชิ้น
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-[#1a1a1a] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded-lg border border-[#333] transition-all"
                          title="แก้ไข"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 bg-[#1a1a1a] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg border border-[#333] transition-all"
                          title="ลบ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal เพิ่ม / แก้ไข สินค้าจริง */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#212121] border border-[#333] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#2f2f2f] pb-4">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Package size={18} className="text-emerald-400" />
                {editingId ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่ลงระบบจริง"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น นมสดเมจิ 830ml"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">บาร์โค้ด / SKU</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="สแกน หรือกรอกเลขบาร์โค้ด"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">ราคาทุน (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">ราคาขาย (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">จำนวนสต็อกเริ่มต้น (ชิ้น)</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="10"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#333] text-xs font-medium text-zinc-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#21F1A8] hover:bg-[#1bd495] text-black font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>กำลังบันทึกลง Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>บันทึกสินค้าจริง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}