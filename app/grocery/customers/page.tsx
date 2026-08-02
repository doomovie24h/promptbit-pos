/**
 * @fileoverview Customer & Member Management Page
 * @module app/grocery/customers/page
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, UserPlus, Search, Phone, Award, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  debt: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    const newCust: Customer = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      points: 0,
      debt: 0,
    };

    setCustomers([newCust, ...customers]);
    toast.success("เพิ่มข้อมูลสมาชิกเรียบร้อยแล้ว");
    setIsModalOpen(false);
    setFormData({ name: "", phone: "" });
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#F0EDE4] dark:bg-[#171717] text-zinc-900 dark:text-zinc-100 p-4 sm:p-8 font-sans transition-colors space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] p-4 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/grocery/dashboard")}
            className="p-2 bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-200 rounded-xl transition-all border border-zinc-200 dark:border-[#383838]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">จัดการข้อมูลลูกค้า / สมาชิก</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ฐานข้อมูลสมาชิก แต้มสะสม และประวัติเงินเชื่อ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
        >
          <UserPlus size={18} />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาตามชื่อสมาชิก หรือเบอร์โทรศัพท์..."
          className="w-full bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-[#2f2f2f]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4 font-semibold">เบอร์โทรศัพท์</th>
                <th className="py-3.5 px-4 font-semibold text-center">แต้มสะสม</th>
                <th className="py-3.5 px-4 font-semibold text-right">ยอดค้างชำระ (เงินเชื่อ)</th>
                <th className="py-3.5 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#2b2b2b]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30 stroke-1" />
                    <p className="text-sm">ยังไม่มีข้อมูลสมาชิกในระบบ</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-[#262626] transition-colors">
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#004741] dark:text-[#21F1A8]" />
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <Award size={13} />
                        {c.points} แต้ม
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-500">
                      ฿{c.debt.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setCustomers(customers.filter((x) => x.id !== c.id));
                          toast.success("ลบข้อมูลสมาชิกเรียบร้อย");
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่มสมาชิก */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#333] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-[#2f2f2f] pb-3">
              <h3 className="font-bold text-base">เพิ่มสมาชิกใหม่</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  ชื่อ - นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  เบอร์โทรศัพท์ *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#004741] dark:focus:ring-[#21F1A8]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-[#2b2b2b] text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004741] dark:bg-[#21F1A8] text-white dark:text-black font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>บันทึกสมาชิก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}