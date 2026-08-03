/**
 * @fileoverview Grocery POS Core Logic
 * @module app/grocery/pos/page
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

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
  const [loading, setLoading] = useState(false);

  // โหลดรายการสินค้าทั้งหมดจาก Backend
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/grocery/inventory");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้าและเช็คสต็อก
  const handleAddByBarcode = useCallback((barcodeInput: string) => {
    const cleanCode = barcodeInput.trim();
    const product = products.find((p) => p.barcode === cleanCode);

    if (!product) {
      alert(`ไม่พบสินค้าบาร์โค้ด: ${cleanCode}`);
      return;
    }

    if (product.stock <= 0) {
      alert(`สินค้า ${product.name} หมดสต็อก!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          alert(`สินค้าในสต็อกไม่เพียงพอ (เหลือ ${product.stock})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
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
              alert(`เกินจำนวนสต็อกที่มี (เหลือ ${product.stock})`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ทำการชำระเงินและบันทึกรายการลดสต็อก
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
        alert("ชำระเงินสำเร็จ!");
        setCart([]);
        fetchProducts(); // รีเฟรชสต็อกใหม่
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errData.message || "ไม่สามารถทำรายการได้"}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh", color: "#000" }}>
      <h1>ระบบ POS ขายหน้าร้าน</h1>
      
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* ฝั่งซ้าย: สแกนและรายการสินค้า */}
        <div style={{ flex: 2, background: "#fff", padding: "16px", borderRadius: "8px" }}>
          <button
            onClick={() => setIsScanning(true)}
            style={{ padding: "12px 20px", background: "blue", color: "#fff", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", width: "100%" }}
          >
            เปิดกล้องสแกนบาร์โค้ด
          </button>

          <form onSubmit={handleManualSubmit} style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="กรอกบาร์โค้ดด้วยมือ หรือใช้เครื่องยิง USB"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              autoFocus
            />
            <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>เพิ่ม</button>
          </form>

          <h3 style={{ marginTop: "20px" }}>รายการสินค้าทั้งหมดในสต็อก</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
            {products.map((p) => (
              <div key={p.id} onClick={() => handleAddByBarcode(p.barcode)} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "4px", cursor: "pointer", background: "#fafafa" }}>
                <div><strong>{p.name}</strong></div>
                <div>ราคา: {p.price} บาท</div>
                <div style={{ color: p.stock > 0 ? "green" : "red" }}>สต็อก: {p.stock}</div>
                <div style={{ fontSize: "11px", color: "#666" }}>Barcode: {p.barcode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ฝั่งขวา: ตะกร้าสินค้าและการชำระเงิน */}
        <div style={{ flex: 1, background: "#fff", padding: "16px", borderRadius: "8px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2>ตะกร้าสินค้า</h2>
            {cart.length === 0 ? (
              <p style={{ color: "#666" }}>ยังไม่มีสินค้าในตะกร้า</p>
            ) : (
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
                    <div>
                      <div>{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>{item.price} x {item.quantity}</div>
                    </div>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: "2px 6px" }}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: "2px 6px" }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <hr style={{ margin: "15px 0" }} />
            <h3>ยอดรวมสุทธิ: {totalPrice} บาท</h3>
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              style={{ width: "100%", padding: "12px", background: "green", color: "#fff", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", marginTop: "10px" }}
            >
              {loading ? "กำลังบันทึก..." : "ชำระเงิน (ตัดสต็อก)"}
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