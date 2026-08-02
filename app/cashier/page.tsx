"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  PackageX,
  Loader2,
  RefreshCcw,
  MessageSquare
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  category?: any;
  stock?: number;
};

type CartItem = Product & {
  quantity: number;
  note?: string;
};

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr" | "credit">("cash");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const productList = Array.isArray(json) ? json : (json.data ?? json.products ?? []);
      setProducts(productList);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const handleFocus = () => fetchProducts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchProducts]);

  const getCategoryName = (cat: any): string => {
    if (!cat) return "ทั่วไป";
    if (typeof cat === "string") return cat;
    if (typeof cat === "object" && cat !== null) {
      return cat.name || cat.id || "ทั่วไป";
    }
    return String(cat);
  };

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => getCategoryName(p.category))))];

  const filteredProducts = products.filter((item) => {
    const itemCatName = getCategoryName(item.category);
    const matchesCategory = selectedCategory === "ALL" || itemCatName === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, note: "" }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemNote = (id: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            note: item.note || "",
          })),
          totalAmount: total,
          paymentMethod: paymentMethod,
          status: "WAITING",
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      alert("ชำระเงินสำเร็จ และส่งออเดอร์เข้าครัวเรียบร้อยแล้ว!");
      setCart([]);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกออเดอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ฝั่งซ้าย: รายการสินค้า */}
      <div className="flex-1 flex flex-col h-full p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={fetchProducts}
              title="รีเฟรชรายการสินค้า"
              className="h-10 px-3 rounded-xl border bg-card text-muted-foreground hover:bg-accent flex items-center justify-center shrink-0 cursor-pointer transition-all"
            >
              <RefreshCcw size={16} className={loadingProducts ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground border hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loadingProducts && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-xs">กำลังโหลดสินค้าของคุณ...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
              <PackageX size={48} />
              <p className="text-sm font-medium">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-card border text-left transition-all hover:shadow-lg active:scale-95 cursor-pointer group"
                >
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {getCategoryName(product.category)}
                      </span>
                      {product.stock !== undefined && (
                        <span className="text-[10px] text-muted-foreground">คงเหลือ {product.stock}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold line-clamp-2 pt-1 group-hover:text-primary">
                      {product.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full pt-4 mt-2 border-t">
                    <span className="text-sm font-bold text-primary">฿{product.price}</span>
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Plus size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ฝั่งขวา: ตะกร้าสินค้า */}
      <div className="w-full md:w-96 bg-card border-l flex flex-col h-full shadow-xl">
        <div className="flex items-center justify-between px-4 py-3.5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <span className="text-xs font-bold">ตะกร้าสินค้า</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} รายการ
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <ShoppingCart size={40} strokeWidth={1.5} />
              <p className="text-xs">ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col p-2.5 rounded-xl bg-muted/50 border gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 truncate pr-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[11px] text-primary font-semibold">฿{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(editingNoteId === item.id ? null : item.id)}
                      title="เพิ่มหมายเหตุ"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        item.note ? "bg-amber-500 text-white border-amber-500" : "bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <MessageSquare size={13} />
                    </button>
                    <div className="flex items-center border rounded-lg bg-background overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-muted text-muted-foreground cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-muted text-muted-foreground cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* กล่องใส่หมายเหตุเฉพาะรายการ */}
                {(editingNoteId === item.id || item.note) && (
                  <input
                    type="text"
                    placeholder="หมายเหตุ (เช่น ไม่ใส่ผัก, เผ็ดน้อย)..."
                    value={item.note || ""}
                    onChange={(e) => updateItemNote(item.id, e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-amber-600 dark:text-amber-400 font-medium"
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "cash", label: "เงินสด", icon: Banknote },
              { id: "qr", label: "QR Code", icon: QrCode },
              { id: "credit", label: "บัตร", icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  {method.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-muted-foreground">
              <span>ยอดรวมสินค้า</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>ภาษีมูลค่าเพิ่ม (7%)</span>
              <span>฿{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-primary">฿{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCheckout}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            {isCheckingOut ? "กำลังบันทึกออเดอร์..." : `ชำระเงิน ฿{total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}