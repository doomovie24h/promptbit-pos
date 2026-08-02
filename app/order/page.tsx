"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { UtensilsCrossed, Plus, ShoppingCart, Check, SlidersHorizontal, Store, CheckCircle2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
  sweetness: string;
  noteText: string;
}

const SWEETNESS_LEVELS = ["หวาน 0%", "หวาน 25%", "หวาน 50%", "หวาน 75%", "หวาน 100% (ปกติ)"];

export default function CustomerOrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");

  const [tableName, setTableName] = useState("กำลังโหลดโต๊ะ...");
  const [storeName, setStoreName] = useState("ร้านค้า");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Modal เลือกระดับความหวาน
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sweetness, setSweetness] = useState("หวาน 100% (ปกติ)");
  const [customNote, setCustomNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // โหลดข้อมูลโต๊ะและสินค้าของร้านผ่าน Table ID
    if (tableId) {
      fetch(`/api/customer/menu?tableId=${tableId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setTableName(json.data.tableName);
            setStoreName(json.data.storeName);
            setProducts(json.data.products);
          } else {
            setTableName("ไม่พบข้อมูลโต๊ะ");
          }
        })
        .catch(() => setTableName("เกิดข้อผิดพลาดในการโหลด"))
        .finally(() => setLoading(false));
    } else {
      setTableName("ไม่พบรหัสโต๊ะ");
      setLoading(false);
    }
  }, [tableId]);

  const handleOpenModifier = (product: Product) => {
    setSelectedProduct(product);
    setSweetness("หวาน 100% (ปกติ)");
    setCustomNote("");
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      ...selectedProduct,
      quantity: 1,
      sweetness,
      noteText: customNote,
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === selectedProduct.id && item.sweetness === sweetness
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, newItem];
    });

    setIsModalOpen(false);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !tableId) return;

    try {
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          items: cart.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
            note: `${i.sweetness} ${i.noteText ? `/ ${i.noteText}` : ""}`.trim(),
          })),
          total: totalAmount,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setOrderSuccess(true);
        setCart([]);
      } else {
        alert(json.message || "ไม่สามารถส่งออร์เดอร์ได้");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#171717] text-zinc-100 flex items-center justify-center p-6 text-center">
        <div className="bg-[#212121] border border-[#2f2f2f] p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
          <CheckCircle2 size={64} className="text-[#21F1A8] mx-auto" />
          <h1 className="text-2xl font-bold">ส่งออร์เดอร์สำเร็จ!</h1>
          <p className="text-sm text-zinc-400">
            ระบบได้ส่งรายการอาหารไปยังห้องครัว/บาร์เรียบร้อยแล้ว กรุณารอสักครู่ อาหารกำลังถูกจัดเตรียมให้ท่านที่ <span className="text-[#21F1A8] font-bold">{tableName}</span>
          </p>
          <button
            onClick={() => setOrderSuccess(false)}
            className="w-full bg-[#21F1A8] text-black py-3 rounded-xl font-semibold text-sm transition-all"
          >
            สั่งอาหารเพิ่มเติม
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717] text-zinc-100 flex flex-col max-w-2xl mx-auto pb-24">
      {/* Header ร้านและโต๊ะ */}
      <div className="bg-[#212121] border-b border-[#2f2f2f] p-6 sticky top-0 z-20 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#21F1A8] uppercase tracking-wider flex items-center gap-1.5">
            <Store size={14} /> {storeName}
          </span>
          <span className="bg-[#21F1A8]/10 border border-[#21F1A8]/30 text-[#21F1A8] px-3 py-1 rounded-full text-xs font-bold">
            {tableName}
          </span>
        </div>
        <h1 className="text-xl font-bold">เมนูอาหารและเครื่องดื่ม</h1>
      </div>

      {/* รายการสินค้า */}
      <div className="p-6 space-y-4 flex-1">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">กำลังโหลดเมนู...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">ยังไม่มีเมนูสินค้าในขณะนี้</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleOpenModifier(product)}
                className="bg-[#212121] border border-[#2f2f2f] hover:border-[#21F1A8] p-4 rounded-2xl text-left flex justify-between items-center transition-all group"
              >
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-[#21F1A8] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-emerald-400 font-bold mt-1">฿{product.price}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-zinc-800 group-hover:bg-[#21F1A8] group-hover:text-black flex items-center justify-center transition-all">
                  <Plus size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ตะกร้าและปุ่มยืนยันด้านล่าง */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#212121]/95 backdrop-blur-md border-t border-[#2f2f2f] p-4 max-w-2xl mx-auto flex items-center justify-between shadow-2xl z-30">
          <div>
            <p className="text-xs text-zinc-400">รวม {cart.reduce((s, i) => s + i.quantity, 0)} รายการ</p>
            <p className="text-lg font-bold text-[#21F1A8]">฿{totalAmount.toFixed(2)}</p>
          </div>
          <button
            onClick={handleSubmitOrder}
            className="bg-[#21F1A8] hover:bg-[#1bd495] text-black px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
          >
            <ShoppingCart size={18} /> สั่งอาหารเข้าครัว
          </button>
        </div>
      )}

      {/* Modal เลือกระดับความหวาน */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#212121] border border-[#333] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">{selectedProduct.name}</h3>
              <p className="text-sm text-zinc-400">เลือกความหวานหรือตัวเลือกเพิ่มเติม</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-[#21F1A8]" /> ระดับความหวาน
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SWEETNESS_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSweetness(lvl)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      sweetness === lvl
                        ? "bg-[#21F1A8]/10 border-[#21F1A8] text-[#21F1A8]"
                        : "bg-[#1a1a1a] border-[#333] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span>{lvl}</span>
                    {sweetness === lvl && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">หมายเหตุเพิ่มเติม</label>
              <input
                type="text"
                placeholder="เช่น ไม่ใส่น้ำแข็ง, แยกน้ำแข็ง"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-[#21F1A8]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-sm font-medium transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#21F1A8] hover:bg-[#1bd495] text-black py-3 rounded-xl text-sm font-semibold transition-all"
              >
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}