"use client";

import { useState, useEffect } from "react";
import { QrCode, Plus, Printer, Trash2, Store, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";

interface DiningTable {
  id: string;
  name: string;
  qrCode: string;
  status: string;
}

export default function TableManagementPage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [storeName, setStoreName] = useState("ร้านของคุณ");
  const [tableNameInput, setTableNameInput] = useState("");
  const [batchCount, setBatchCount] = useState<number>(5); // สำหรับสร้างหลายโต๊ะรวด
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // โหลดข้อมูลโต๊ะและชื่อร้าน
  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      const json = await res.json();
      if (json.success) {
        setTables(json.data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    // ดึงชื่อร้านจาก stats หรือ api อื่นๆ (ถ้ามี)
    fetch("/api/grocery/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.storeName) {
          setStoreName(json.data.storeName);
        }
      })
      .catch(() => {});
  }, []);

  // เพิ่มโต๊ะเดี่ยว
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNameInput.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tableNameInput }),
      });
      const json = await res.json();
      if (json.success) {
        setTableNameInput("");
        fetchTables();
      } else {
        alert(json.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // สร้างโต๊ะแบบกลุ่ม (เช่น สร้าง โต๊ะ 1 ถึง โต๊ะ N รวดเดียว)
  const handleBatchCreate = async () => {
    if (batchCount <= 0) return;
    setIsCreating(true);
    try {
      // หาเลขโต๊ะเริ่มต้นถัดไป
      const startNum = tables.length + 1;
      for (let i = 0; i < batchCount; i++) {
        const tableNum = `โต๊ะ ${startNum + i}`;
        await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: tableNum }),
        });
      }
      fetchTables();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // ฟังก์ชันสั่งพิมพ์ QR Code (Print Friendly)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#171717] text-zinc-100 p-8 space-y-8">
      {/* ส่วนหัว (ซ่อนเวลาสั่งพิมพ์) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#212121] border border-[#2f2f2f] p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#21F1A8] uppercase tracking-wider">
            <Store size={14} />
            <span>ระบบจัดการโต๊ะอาหารและคาเฟ่ (Table & QR Menu)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการ QR Code ประจำโต๊ะ</h1>
          <p className="text-sm text-zinc-400">
            สร้างและพิมพ์ QR Code สำหรับให้ลูกค้าสแกนสั่งอาหาร/เครื่องดื่มที่โต๊ะได้ทันที
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#21F1A8] hover:bg-[#1bd495] text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
          >
            <Printer size={18} />
            <span>พิมพ์ QR Code ทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* ฟอร์มสร้างโต๊ะ (ซ่อนเวลาสั่งพิมพ์) */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* เพิ่มทีละโต๊ะ */}
        <div className="bg-[#212121] border border-[#2f2f2f] p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Plus size={18} className="text-[#21F1A8]" /> เพิ่มโต๊ะใหม่
          </h2>
          <form onSubmit={handleAddTable} className="flex gap-3">
            <input
              type="text"
              placeholder="ระบุชื่อหรือเลขโต๊ะ (เช่น โต๊ะ 01, VIP 1)"
              value={tableNameInput}
              onChange={(e) => setTableNameInput(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-[#21F1A8]"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="bg-[#004741] hover:bg-[#003833] text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
            >
              เพิ่มโต๊ะ
            </button>
          </form>
        </div>

        {/* สร้างแบบกลุ่ม */}
        <div className="bg-[#212121] border border-[#2f2f2f] p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Layers size={18} className="text-[#21F1A8]" /> สร้างโต๊ะแบบรวดเร็ว (Batch Create)
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2">
              <span className="text-xs text-zinc-400">สร้างเพิ่มอีก</span>
              <input
                type="number"
                min={1}
                max={50}
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-16 bg-transparent text-center font-bold text-[#21F1A8] focus:outline-none"
              />
              <span className="text-xs text-zinc-400">โต๊ะ</span>
            </div>
            <button
              onClick={handleBatchCreate}
              disabled={isCreating}
              className="bg-[#21F1A8]/10 hover:bg-[#21F1A8]/20 border border-[#21F1A8]/30 text-[#21F1A8] px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            >
              สร้างอัตโนมัติ
            </button>
          </div>
        </div>
      </div>

      {/* แสดงรายการโต๊ะและ QR Code (ส่วนนี้จะถูกพิมพ์ออกมาสวยงาม) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">รายการโต๊ะทั้งหมด ({tables.length} โต๊ะ)</h2>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">กำลังโหลดข้อมูลโต๊ะ...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-20 bg-[#212121] border border-[#2f2f2f] rounded-2xl text-zinc-400">
            ยังไม่มีโต๊ะในระบบ เริ่มสร้างโต๊ะแรกของคุณด้านบนได้เลยครับ
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => {
              // URL สำหรับให้ลูกค้าสแกน (เช่น ไปหน้าสั่งอาหารประจำโต๊ะ)
              const scanUrl = `http://localhost:3000/order?table=${table.id}`;
              // ใช้บริการ QR Generator สาธารณะแบบปลอดภัยและคมชัด
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                scanUrl
              )}`;

              return (
                <div
                  key={table.id}
                  className="bg-white text-zinc-900 border border-zinc-200 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-4 relative print:border-2 print:border-black print:shadow-none break-inside-avoid"
                >
                  {/* ป้ายชื่อร้านด้านบนการ์ด */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 print:text-zinc-600">
                      Scan to Order
                    </span>
                    <h3 className="text-base font-extrabold text-[#004741] truncate max-w-[200px]">
                      {storeName}
                    </h3>
                  </div>

                  {/* รูป QR Code */}
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100 shadow-inner">
                    <img
                      src={qrImageUrl}
                      alt={`QR Code ${table.name}`}
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>

                  {/* หมายเลขโต๊ะเน้นย้ำชัดเจน */}
                  <div className="w-full bg-zinc-900 text-white print:bg-black print:text-white py-2.5 rounded-2xl font-black text-lg tracking-wide shadow-md">
                    {table.name}
                  </div>

                  <p className="text-[11px] text-zinc-400">สแกนเพื่อดูเมนูและสั่งอาหารที่โต๊ะ</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}