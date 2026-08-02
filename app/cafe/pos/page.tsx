"use client";

import { useState, useEffect } from "react";
import { Coffee, Plus, Trash2, ShoppingCart, Check, SlidersHorizontal } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
  sweetness: string; // ระดับความหวาน
  noteText: string;   // โน้ตเพิ่มเติม
}

const SWEETNESS_LEVELS = ["หวาน 0%", "หวาน 25%", "หวาน 50%", "หวาน 75%", "หวาน 100% (ปกติ)"];

export default function CafePOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal สำหรับเลือกความหวาน
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sweetness, setSweetness] = useState("หวาน 100% (ปกติ)");
  const [customNote, setCustomNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // โหลดสินค้าของร้านคาเฟ่
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/cafe/products"); // หรือดึงจาก API สินค้าทั่วไป
        const json = await res.json();
        if (json.success) {
          setProducts(json.data || []);
        } else {
          // Mock data ตัวอย่างชั่วคราวถ้ายังไม่มี API สินค้าคาเฟ่
          setProducts([
            { id: "1", name: "Iced Americano", price: 60, stock: 50 },
            { id: "2", name: "Latte", price: 75, stock: 40 },
            { id: "3", name: "Green Tea Latte", price: 80, stock: 30 },
            { id: "4", name: "Cocoa", price: 70, stock: 25 },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // กดเลือกสินค้าเพื่อเปิด Modal เลือกความหวาน
  const handleOpenModifier = (product: Product) => {
    setSelectedProduct(product);
    setSweetness("หวาน 100% (ปกติ)");
    setCustomNote("");
    setIsModalOpen(true);
  };

  // ยืนยันเพิ่มลงตะกร้าพร้อมความหวาน
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const newItem: CartItem = {
      ...selectedProduct,
      quantity: 1,
      sweetness,
      noteText: customNote,
    };

    setCart((prev) => {
      // เช็คว่ามีสินค้าตัวเดิม + ความหวานเดียวกันไหม ถ้ามีให้บวกจำนวนเพิ่ม
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

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ส่งออร์เดอร์ไปครัว/ชำระเงิน
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const res = await fetch("/api/cafe/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        alert("สั่งเครื่องดื่มสำเร็จ บันทึกออร์เดอร์เรียบร้อย!");
        setCart([]);
      } else {
        alert(json.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-zinc-100 flex flex-col md:flex-row">
      {/* ฝั่งซ้าย: รายการเมนูเครื่องดื่ม */}
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Coffee className="text-[#21F1A8]" /> ระบบแคชเชียร์คาเฟ่ (Cafe POS)
            </h1>
            <p className="text-sm text-zinc-400">เลือกเมนูเครื่องดื่มและระดับความหวานตามออร์เดอร์ลูกค้า</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">กำลังโหลดเมนู...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleOpenModifier(product)}
                className="bg-[#212121] border border-[#2f2f2f] hover:border-[#21F1A8] p-4 rounded-2xl text-left flex flex-col justify-between transition-all group"
              >
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-[#21F1A8] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">คงเหลือ: {product.stock} แก้ว</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-lg text-emerald-400">฿{product.price}</span>
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-[#21F1A8] group-hover:text-black flex items-center justify-center transition-all">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ฝั่งขวา: ตะกร้าสินค้าและการชำระเงิน */}
      <div className="w-full md:w-[380px] bg-[#1e1e1e] border-l border-[#2f2f2f] p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#2f2f2f] pb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <ShoppingCart size={18} /> รายการสั่งซื้อ (Cart)
            </h2>
            <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-300">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} แก้ว
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-sm">ยังไม่มีรายการเครื่องดื่มในตะกร้า</div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="bg-[#252525] border border-[#333] p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-[#21F1A8] font-medium mt-0.5">✨ {item.sweetness}</p>
                      {item.noteText && <p className="text-xs text-zinc-400">📝 {item.noteText}</p>}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#333]/50 text-xs">
                    <span className="text-zinc-400">จำนวน: {item.quantity}</span>
                    <span className="font-bold text-sm text-emerald-400">฿{item.price * item.quantity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ส่วนคำนวณเงินและปุ่มชำระเงิน */}
        <div className="space-y-4 pt-4 border-t border-[#2f2f2f]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>ยอดรวมเครื่องดื่ม</span>
              <span>฿{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-zinc-100 pt-2 border-t border-[#333]">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-[#21F1A8]">฿{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-[#21F1A8] hover:bg-[#1bd495] disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-3.5 rounded-xl font-semibold transition-all shadow-lg"
          >
            ชำระเงิน / ยืนยันออร์เดอร์
          </button>
        </div>
      </div>

      {/* Modal เลือกระดับความหวาน */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#212121] border border-[#333] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">{selectedProduct.name}</h3>
              <p className="text-sm text-zinc-400">ปรับแต่งระดับความหวานและตัวเลือกเสริม</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-[#21F1A8]" /> เลือกระดับความหวาน
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
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                หมายเหตุเพิ่มเติม (ถ้ามี)
              </label>
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
                ยืนยันใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}