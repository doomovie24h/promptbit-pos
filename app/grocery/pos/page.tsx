/**
 * @fileoverview Grocery POS Page - Modern UI & Functional Flow
 * @module app/grocery/pos/page
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import { ShoppingCart, Scan, Plus, Minus, Trash2, CheckCircle2, Search, Package } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function GroceryPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/grocery/inventory");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else if (data.products) setProducts(data.products);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddByBarcode = useCallback((barcodeInput: string) => {
    const cleanCode = barcodeInput.trim();
    const product = products.find((p) => p.barcode === cleanCode);

    if (!product) {
      toast.error(`ไม่พบสินค้าบาร์โค้ด: ${cleanCode}`);
      return;
    }

    if (product.stock <= 0) {
      toast.error(`สินค้า ${product.name} หมดสต็อก!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          toast.warning(`สินค้าในสต็อกไม่เพียงพอ (เหลือ ${product.stock})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, [products]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode) return;
    handleAddByBarcode(manualBarcode);
    setManualBarcode("");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            const product = products.find((p) => p.id === id);
            if (product && newQty > product.stock) {
              toast.warning(`เกินจำนวนสต็อกที่มี (เหลือ ${product.stock})`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/grocery/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
          totalAmount: totalPrice,
          paymentMethod: "CASH",
        }),
      });

      if (res.ok) {
        toast.success("ชำระเงินและตัดสต็อกสำเร็จ!");
        setCart([]);
        fetchProducts();
      } else {
        const errData = await res.json();
        toast.error(`เกิดข้อผิดพลาด: ${errData.message || "ไม่สามารถทำรายการได้"}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 p-6 flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#121622] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ระบบขายหน้าร้าน (POS)</h1>
            <p className="text-xs text-zinc-400">สแกนบาร์โค้ดเพื่อตัดสต็อกและคิดเงินทันที</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsScanning(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all"
          >
            <Scan size={18} />
            <span>เปิดกล้องสแกนบาร์โค้ด</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Product List & Search */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-[#121622] border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า หรือพิมพ์บาร์โค้ด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0D14] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="ยิงบาร์โค้ด (USB Scanner)"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="bg-[#0A0D14] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 w-48"
              />
              <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all">
                เพิ่ม
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[550px] pr-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddByBarcode(p.barcode)}
                className="bg-[#0A0D14] border border-zinc-800/80 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-2 group"
              >
                <div>
                  <h3 className="font-bold text-sm text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{p.barcode}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-400 font-bold text-sm">฿{p.price.toLocaleString()}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${p.stock > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    คงเหลือ: {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="bg-[#121622] border border-zinc-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-500" />
                <h2 className="font-bold text-sm">ตะกร้าสินค้า</h2>
              </div>
              <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-300 font-medium">
                {cart.reduce((acc, i) => acc + i.quantity, 0)} ชิ้น
              </span>
            </div>

            <div className="overflow-y-auto max-h-[380px] flex flex-col gap-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <ShoppingCart size={32} className="opacity-30" />
                  <span>ยังไม่มีสินค้าในตะกร้า ลองสแกนบาร์โค้ดหรือคลิกสินค้าด้านซ้าย</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-[#0A0D14] border border-zinc-800 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                      <p className="text-[11px] text-blue-400 font-medium">฿{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors ml-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">ยอดรวมสุทธิ</span>
              <span className="text-xl font-black text-emerald-400">฿{totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 size={18} />
              <span>{loading ? "กำลังบันทึก..." : "ชำระเงินและตัดสต็อก"}</span>
            </button>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleAddByBarcode}
      />
    </div>
  );
}