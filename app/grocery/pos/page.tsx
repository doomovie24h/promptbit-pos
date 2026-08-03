/**
 * @fileoverview Grocery POS Screen - Bangkok Bank Theme & Hardware Integration (USB/Bluetooth)
 * @module app/grocery/pos/page
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  CreditCard,
  X,
  Banknote,
  QrCode,
  Settings,
  Loader2,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Trash2,
  Moon,
  Sun,
  Globe,
  Store,
  Printer,
  Volume2,
  VolumeX,
  ShoppingCart,
  Bluetooth,
  Usb,
  Smartphone,
  Monitor
} from "lucide-react";
import ReceiptModal, { ReceiptTransaction, StoreInfo } from "@/components/pos/ReceiptModal";

interface ProductCategory {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ProductCategory | string;
  barcode?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  currentDebt: number;
}

interface BusinessInfoData {
  id?: string | number;
  storeId?: string | number;
  storeName?: string;
  name?: string;
  address?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  storePhone?: string;
  taxId?: string;
  branch?: string;
  logoUrl?: string;
  logo?: string;
  promptPay?: string;
  promptPayNumber?: string;
  promptpay?: string;
  prompt_pay?: string;
  store_phone?: string;
  mobile?: string;
}

export default function GroceryPOS() {
  const [language, setLanguage] = useState<"th" | "en">("th");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Store & Business Info States
  const [storeName, setStoreName] = useState<string>("Bangkok Grocery POS");
  const [storeId, setStoreId] = useState<string>("");
  const [promptPayNumber, setPromptPayNumber] = useState<string>("");
  const [storeAddress, setStoreAddress] = useState<string>("");
  const [storePhone, setStorePhone] = useState<string>("");
  const [storeTaxId, setStoreTaxId] = useState<string>("");
  const [storeBranch, setStoreBranch] = useState<string>("");
  const [storeLogo, setStoreLogo] = useState<string>("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PROMPTPAY" | "CREDIT">("CASH");
  const [receivedAmount, setReceivedAmount] = useState<string>("");
  
  // Hardware Connection States
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [isConnectingHardware, setIsConnectingHardware] = useState<boolean>(false);

  const [enabledMethods, setEnabledMethods] = useState({
    cash: true,
    promptpay: true,
    credit: true,
    soundEnabled: true,
    autoPrint: true,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Receipt Modal Control State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [completedTransaction, setCompletedTransaction] = useState<ReceiptTransaction | null>(null);

  const playScanSound = (): void => {
    if (!enabledMethods.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e: unknown) {
      console.error("Audio playback error:", e);
    }
  };

  // Hardware Connect Handlers (USB Serial & Bluetooth)
  const connectUsbDevice = async () => {
    setIsConnectingHardware(true);
    try {
      if (!("serial" in navigator)) {
        alert(language === "th" ? "เบราว์เซอร์นี้ไม่รองรับ Web Serial API (USB)" : "Web Serial API not supported");
        return;
      }
      const port = await (navigator as unknown as { serial: { requestPort: () => Promise<unknown> } }).serial.requestPort();
      if (port) {
        setConnectedDevice("USB Serial Scanner/Printer");
        alert(language === "th" ? "เชื่อมต่ออุปกรณ์ USB สำเร็จ" : "USB Device Connected Successfully");
      }
    } catch (err) {
      console.error("USB Connection error:", err);
    } finally {
      setIsConnectingHardware(false);
    }
  };

  const connectBluetoothDevice = async () => {
    setIsConnectingHardware(true);
    try {
      if (!("bluetooth" in navigator)) {
        alert(language === "th" ? "เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth" : "Web Bluetooth API not supported");
        return;
      }
      const device = await (navigator as unknown as { bluetooth: { requestDevice: (options: unknown) => Promise<{ name?: string }> } }).bluetooth.requestDevice({
        acceptAllDevices: true,
      });
      if (device) {
        setConnectedDevice(device.name || "Bluetooth Printer");
        alert(language === "th" ? `เชื่อมต่อ ${device.name || "Bluetooth"} สำเร็จ` : "Bluetooth Connected Successfully");
      }
    } catch (err) {
      console.error("Bluetooth Connection error:", err);
    } finally {
      setIsConnectingHardware(false);
    }
  };

  const fetchPOSData = async (): Promise<void> => {
    try {
      setIsLoadingData(true);
      const [prodRes, custRes, businessRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/customers').catch(() => null),
        fetch('/api/business').catch(() => null),
      ]);

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : (prodData.data || prodData.products || []));
      }
      if (custRes && custRes.ok) {
        const custData = await custRes.json();
        setCustomers(Array.isArray(custData) ? custData : (custData.customers || custData.data || []));
      }
      if (businessRes && businessRes.ok) {
        const bData = await businessRes.json();
        const businessInfo: BusinessInfoData = bData.data || bData;
        if (businessInfo.id || businessInfo.storeId) {
          setStoreId(String(businessInfo.id || businessInfo.storeId));
        }
        if (businessInfo.storeName || businessInfo.name) {
          setStoreName(businessInfo.storeName || businessInfo.name || "Bangkok Grocery POS");
        }
        if (businessInfo.address) setStoreAddress(businessInfo.address);
        if (businessInfo.phone || businessInfo.phoneNumber || businessInfo.storePhone) {
          setStorePhone(String(businessInfo.phone || businessInfo.phoneNumber || businessInfo.storePhone));
        }
        if (businessInfo.taxId) setStoreTaxId(businessInfo.taxId);
        if (businessInfo.branch) setStoreBranch(businessInfo.branch);
        if (businessInfo.logoUrl || businessInfo.logo) setStoreLogo(businessInfo.logoUrl || businessInfo.logo || "");

        const realPromptPay =
          businessInfo.promptPay ||
          businessInfo.promptPayNumber ||
          businessInfo.promptpay ||
          businessInfo.prompt_pay ||
          businessInfo.phone ||
          businessInfo.phoneNumber ||
          businessInfo.phone_number ||
          businessInfo.storePhone ||
          businessInfo.store_phone ||
          businessInfo.mobile ||
          businessInfo.taxId || "";

        if (realPromptPay) {
          setPromptPayNumber(String(realPromptPay).trim());
        }
      }
    } catch (error: unknown) {
      console.error("Failed to load POS data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPOSData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category || "ทั่วไป");
      const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode || "").includes(searchQuery);
      const matchesCategory = selectedCategory === "all" || catName === selectedCategory || (selectedCategory === "ทั่วไป" && catName === "ทั่วไป");
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const t = {
    receivePayment: language === "th" ? "รับชำระเงิน" : "Receive Payment",
    totalToPay: language === "th" ? "ยอดรวมทั้งสิ้น" : "Total to Pay",
    cash: language === "th" ? "เงินสด" : "Cash",
    promptpay: language === "th" ? "พร้อมเพย์" : "PromptPay",
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0;
    return received > totalAmount ? received - totalAmount : 0;
  }, [receivedAmount, totalAmount]);

  const promptPayQrUrl = useMemo(() => {
    if (!promptPayNumber) return "";
    return `https://promptpay.io/${promptPayNumber}/${totalAmount}.png`;
  }, [promptPayNumber, totalAmount]);

  const addToCart = (product: Product): void => {
    if (product.stock <= 0) {
      alert(language === "th" ? "สินค้าหมดสต็อก" : "Product out of stock");
      return;
    }
    playScanSound();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(language === "th" ? "เกินจำนวนสต็อกที่มี" : "Exceeds available stock");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number): void => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const product = products.find((p) => p.id === id);
            const maxStock = product ? product.stock : 999;
            const newQty = item.quantity + delta;
            if (newQty > maxStock) {
              alert(language === "th" ? "เกินจำนวนสต็อกในคลัง" : "Exceeds stock limit");
              return item;
            }
            if (delta > 0) playScanSound();
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string): void => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckoutSubmit = async (): Promise<void> => {
    if (!storeId) {
      alert(language === "th" ? "ไม่พบรหัสร้านค้า กรุณาตรวจสอบการตั้งค่าธุรกิจ" : "Store ID missing. Please check business setup.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          items: cart,
          paymentMethod,
          receivedAmount: parseFloat(receivedAmount) || 0,
          totalAmount,
          customerId: selectedCustomer?.id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Checkout failed');
      }
      const transactionId = data.transactionId || data.id || `TX-${Date.now().toString().slice(-6)}`;
      const receiptPayload: ReceiptTransaction = {
        id: transactionId,
        date: new Date().toLocaleString('th-TH'),
        items: cart.map((item) => ({
          cartItemId: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unitName: language === "th" ? "ชิ้น" : "pcs",
          total: item.price * item.quantity,
        })),
        subtotal: totalAmount,
        discount: 0,
        tax: 0,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        receivedAmount: parseFloat(receivedAmount) || totalAmount,
        changeAmount: changeAmount,
        customerName: selectedCustomer ? selectedCustomer.name : undefined,
        cashierName: "Admin",
      };
      setCompletedTransaction(receiptPayload);
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
      setIsMobileCartOpen(false);
      setCart([]);
      setReceivedAmount("");
      setSelectedCustomer(null);
      setIsReceiptModalOpen(true);
      await fetchPOSData();
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);
      setIsSubmitting(false);
      alert(err.message || (language === "th" ? "เกิดข้อผิดพลาดในการทำรายการ" : "Error processing payment"));
    }
  };

  const currentStoreInfo: StoreInfo = {
    name: storeName,
    address: storeAddress,
    phone: storePhone,
    taxId: storeTaxId,
    branch: storeBranch,
    logoUrl: storeLogo,
  };

  const renderCartContent = () => (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <ShoppingBag className="text-[#0066FF]" size={18} />
          <span>{language === "th" ? "รายการสินค้าในตะกร้า" : "Current Order"}</span>
        </h2>
        <span className="text-xs bg-[#0066FF]/15 text-[#0066FF] px-2 py-0.5 rounded-md font-medium">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} {language === "th" ? "รายการ" : "items"}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-360px)] pr-1 flex-1">
        {cart.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs">
            {language === "th" ? "ยังไม่มีสินค้าในตะกร้า" : "Cart is empty."}
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${isDarkMode ? "bg-[#121214] border-zinc-800" : "bg-[#CCE0FF]/30 border-blue-100"}`}>
              <div className="flex-1 pr-2">
                <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                <p className="text-xs text-[#0066FF] font-mono font-semibold mt-0.5">฿{item.price * item.quantity}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 cursor-pointer">
                  <Minus size={13} />
                </button>
                <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 cursor-pointer">
                  <Plus size={13} />
                </button>
                <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer ml-1">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/40 mt-auto">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-zinc-500">{language === "th" ? "ยอดรวมสุทธิ" : "Subtotal"}</span>
          <span className="text-2xl font-bold text-[#0066FF] font-mono">฿{totalAmount.toLocaleString()}</span>
        </div>

        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            setIsPaymentModalOpen(true);
            setIsMobileCartOpen(false);
          }}
          className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <CreditCard size={17} />
          <span>{language === "th" ? "ชำระเงิน" : "Proceed to Checkout"}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDarkMode ? "bg-[#09090b] text-zinc-100" : "bg-[#F4F7FE] text-slate-900"}`}>
      {/* HEADER - Bangkok Bank Styling */}
      <header className={`px-6 py-4 border-b flex justify-between items-center print:hidden sticky top-0 z-30 shadow-xs ${isDarkMode ? "bg-[#121214] border-zinc-800" : "bg-white border-blue-100"}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#0066FF] text-white p-2.5 rounded-xl shadow-md">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold">{storeName}</h1>
              {connectedDevice && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  Connected: {connectedDevice}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === "th" ? "ระบบหน้าร้านธนาคาร (Bangkok Bank Standard)" : "BBL POS Standard System"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {completedTransaction && (
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20 hover:bg-[#0066FF]/20"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">{language === "th" ? "พิมพ์ใบเสร็จล่าสุด" : "Print Receipt"}</span>
            </button>
          )}

          <button
            onClick={() => setLanguage(language === "th" ? "en" : "th")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              isDarkMode ? "bg-[#1a1a1e] border-zinc-700 text-zinc-200 hover:bg-zinc-800" : "bg-white border-blue-100 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Globe size={15} />
            <span>{language === "th" ? "EN" : "TH"}</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode ? "bg-[#1a1a1e] border-zinc-700 text-amber-400 hover:bg-zinc-800" : "bg-white border-blue-100 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode ? "bg-[#1a1a1e] border-zinc-700 text-zinc-300 hover:bg-zinc-800" : "bg-white border-blue-100 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER - 70/30 Grid Layout for Desktop & Fluid Mobile App UI */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 pb-28 lg:pb-6 print:hidden max-w-[1600px] mx-auto w-full">
        
        {/* PRODUCT CATALOG (70% width on Desktop / 2 Cols on Mobile) */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 flex items-center px-3.5 py-2.5 rounded-2xl border ${isDarkMode ? "bg-[#121214] border-zinc-800" : "bg-white border-blue-100 shadow-xs"}`}>
              <Search size={17} className="text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder={language === "th" ? "ค้นหาสินค้าหรือสแกนบาร์โค้ด..." : "Search products or scan barcode..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-xs"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["all", "ทั่วไป", "drinks", "food", "fresh", "condiment"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/20"
                      : isDarkMode ? "bg-[#121214] border border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border border-blue-100 text-slate-700 hover:bg-blue-50/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <Loader2 className="animate-spin text-[#0066FF]" size={28} />
              <p className="text-xs text-zinc-400">{language === "th" ? "กำลังโหลดข้อมูลสินค้า..." : "Loading products..."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
              {filteredProducts.map((p) => {
                const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category || "ทั่วไป");
                return (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer group ${
                      p.stock <= 0 ? "opacity-40 grayscale cursor-not-allowed" : ""
                    } ${isDarkMode ? "bg-[#121214] border-zinc-800/80 hover:border-[#0066FF]/60 hover:shadow-lg hover:shadow-blue-500/5" : "bg-white border-blue-100/80 hover:border-[#0066FF]/50 shadow-xs hover:shadow-md"}`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#0066FF] tracking-wider bg-[#0066FF]/10 px-2 py-0.5 rounded-md">{catName}</span>
                      <h3 className="font-semibold text-xs mt-2 line-clamp-2 group-hover:text-[#0066FF] transition-colors">{p.name}</h3>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-base font-bold text-[#0066FF] font-mono">฿{p.price}</span>
                      <span className={`text-[10px] font-medium ${p.stock > 0 ? "text-zinc-400" : "text-red-400"}`}>
                        {language === "th" ? `คงเหลือ ${p.stock}` : `Stock: ${p.stock}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CART SUMMARY (Desktop Sidebar - 30% width) */}
        <div className={`hidden lg:flex rounded-2xl border p-4 flex-col justify-between shadow-sm ${isDarkMode ? "bg-[#121214] border-zinc-800" : "bg-white border-blue-100"}`}>
          {renderCartContent()}
        </div>

      </div>

      {/* MOBILE & TABLET: APP-LIKE FLOATING BAR */}
      <div className={`lg:hidden fixed bottom-0 inset-x-0 border-t p-4 shadow-2xl flex items-center justify-between z-40 transition-colors ${isDarkMode ? "bg-[#121214] border-zinc-800 text-white" : "bg-white border-blue-100 text-slate-900"}`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center relative shadow-md">
            <ShoppingCart size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400">{language === "th" ? "ยอดรวมทั้งหมด" : "Total Amount"}</p>
            <p className="text-sm font-bold text-[#0066FF] font-mono">฿{totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-5 py-3 rounded-2xl font-semibold text-xs shadow-lg transition-colors cursor-pointer"
        >
          {language === "th" ? "ดูตะกร้าสินค้า" : "View Cart"} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {/* MOBILE SLIDE-UP CART DRAWER */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in print:hidden">
          <div className={`rounded-t-3xl max-h-[85vh] flex flex-col p-5 border-t shadow-2xl ${isDarkMode ? "bg-[#121214] border-zinc-800 text-white" : "bg-white border-blue-100 text-slate-900"}`}>
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800/40 mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <ShoppingBag className="text-[#0066FF]" size={18} />
                <span>{language === "th" ? "ตะกร้าสินค้าของคุณ" : "Your Cart"}</span>
              </h2>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <X size={17} />
              </button>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1 flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  {language === "th" ? "ยังไม่มีสินค้าในตะกร้า" : "Cart is empty."}
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/60 border-zinc-700/60" : "bg-blue-50/50 border-blue-100"}`}>
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[#0066FF] font-mono font-semibold mt-0.5">฿{item.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] cursor-pointer">
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] cursor-pointer">
                        <Plus size={13} />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-md text-red-500 cursor-pointer ml-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800/40 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-400">{language === "th" ? "ยอดรวมสุทธิ" : "Subtotal"}</span>
                <span className="text-2xl font-bold text-[#0066FF] font-mono">฿{totalAmount.toLocaleString()}</span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  setIsMobileCartOpen(false);
                  setIsPaymentModalOpen(true);
                }}
                className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 shadow-lg"
              >
                <CreditCard size={17} />
                <span>{language === "th" ? "ชำระเงิน" : "Proceed to Checkout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 print:hidden">
          <div className={`w-full max-w-[420px] rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isDarkMode ? "bg-[#121214] border-zinc-800 text-white" : "bg-white border-blue-100 text-slate-900"
          }`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="text-[#0066FF]" size={20} />
                <span>{t.receivePayment}</span>
              </h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-slate-100 text-slate-500"}`}
                disabled={isSubmitting}
              >
                <X size={17} />
              </button>
            </div>
            
            <div className="flex bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-2xl p-4 justify-between items-center">
              <span className="text-xs font-medium">{t.totalToPay}</span>
              <span className="text-2xl font-bold text-[#0066FF] font-mono">฿{totalAmount.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {enabledMethods.cash && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-3 px-2 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "CASH" ? "bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-blue-500/20" : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <Banknote size={18} />
                  <span>{t.cash}</span>
                </button>
              )}
              {enabledMethods.promptpay && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PROMPTPAY")}
                  className={`py-3 px-2 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "PROMPTPAY" ? "bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-blue-500/20" : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <QrCode size={18} />
                  <span>{t.promptpay}</span>
                </button>
              )}
              {enabledMethods.credit && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT")}
                  className={`py-3 px-2 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                    paymentMethod === "CREDIT" ? "bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-blue-500/20" : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <CreditCard size={18} />
                  <span>{language === "th" ? "เงินเชื่อ" : "Credit"}</span>
                </button>
              )}
            </div>

            {paymentMethod === "CASH" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5">{language === "th" ? "รับเงินมา (บาท)" : "Received Amount"}</label>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-3.5 py-3 rounded-2xl border text-lg font-bold font-mono focus:outline-none focus:border-[#0066FF] ${
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    autoFocus
                  />
                </div>
                <div className={`p-3 rounded-xl border flex justify-between items-center ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-xs font-medium">{language === "th" ? "เงินทอน" : "Change"}</span>
                  <span className="text-xl font-bold text-[#0066FF] font-mono">฿{changeAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {paymentMethod === "PROMPTPAY" && (
              <div className="flex flex-col items-center justify-center space-y-3 py-1">
                {promptPayNumber ? (
                  <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center">
                    <img src={promptPayQrUrl} alt="PromptPay QR" className="w-44 h-44 object-contain" />
                    <span className="text-[11px] text-slate-500 mt-2 font-mono font-semibold">PromptPay: {promptPayNumber}</span>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-1">
                    <p className="text-xs text-amber-400 font-medium">{language === "th" ? "ยังไม่ได้ตั้งค่าเบอร์พร้อมเพย์" : "PromptPay not configured"}</p>
                    <p className="text-[10px] text-zinc-400">{language === "th" ? "กรุณาตรวจสอบการตั้งค่าธุรกิจ" : "Please check business setup"}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "CREDIT" && (
              <div className="space-y-3">
                <label className="block text-xs font-medium mb-1.5">{language === "th" ? "เลือกลูกค้า (จดหนี้)" : "Select Customer"}</label>
                <select
                  value={selectedCustomer?.id || ""}
                  onChange={(e) => {
                    const found = customers.find((c) => String(c.id) === e.target.value);
                    setSelectedCustomer(found || null);
                  }}
                  className={`w-full px-3.5 py-3 rounded-2xl border text-xs font-medium focus:outline-none focus:border-[#0066FF] ${
                    isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <option value="">{language === "th" ? "-- เลือกลูกค้า --" : "-- Select Customer --"}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || "-"}) - Debt: ฿{c.currentDebt || 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting || (paymentMethod === "CREDIT" && !selectedCustomer)}
              onClick={handleCheckoutSubmit}
              className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
              <span>{language === "th" ? "ยืนยันการชำระเงิน" : "Confirm Payment"}</span>
            </button>
          </div>
        </div>
      )}

      {/* POS SETTINGS & HARDWARE CONNECT MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 print:hidden">
          <div className={`w-full max-w-[420px] rounded-3xl border shadow-2xl p-6 space-y-5 ${isDarkMode ? "bg-[#121214] border-zinc-800 text-white" : "bg-white border-blue-100 text-slate-900"}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Settings className="text-[#0066FF]" size={18} />
                <span>{language === "th" ? "ตั้งค่าระบบ POS และฮาร์ดแวร์" : "POS & Hardware Settings"}</span>
              </h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-1.5 rounded-xl cursor-pointer">
                <X size={17} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#0066FF] uppercase tracking-wider mb-1">
                {language === "th" ? "เชื่อมต่ออุปกรณ์ภายนอก (USB / Bluetooth)" : "Hardware Connection"}
              </div>
              
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/60 border-zinc-700/60" : "bg-blue-50/50 border-blue-100"}`}>
                <div className="flex items-center gap-3">
                  <Usb className="text-[#0066FF]" size={18} />
                  <div>
                    <p className="text-xs font-medium">{language === "th" ? "เครื่องสแกน/พิมพ์ผ่าน USB" : "USB Serial Device"}</p>
                    <p className="text-[10px] text-zinc-400">{language === "th" ? "เชื่อมต่อพอร์ต Serial/USB" : "Connect via Web Serial API"}</p>
                  </div>
                </div>
                <button
                  onClick={connectUsbDevice}
                  disabled={isConnectingHardware}
                  className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {isConnectingHardware ? <Loader2 size={13} className="animate-spin" /> : (language === "th" ? "เชื่อมต่อ USB" : "Connect USB")}
                </button>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/60 border-zinc-700/60" : "bg-blue-50/50 border-blue-100"}`}>
                <div className="flex items-center gap-3">
                  <Bluetooth className="text-[#0066FF]" size={18} />
                  <div>
                    <p className="text-xs font-medium">{language === "th" ? "เครื่องพิมพ์ Bluetooth" : "Bluetooth Printer"}</p>
                    <p className="text-[10px] text-zinc-400">{language === "th" ? "เชื่อมต่อเครื่องพิมพ์ไร้สาย" : "Connect via Web Bluetooth"}</p>
                  </div>
                </div>
                <button
                  onClick={connectBluetoothDevice}
                  disabled={isConnectingHardware}
                  className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {isConnectingHardware ? <Loader2 size={13} className="animate-spin" /> : (language === "th" ? "เชื่อมต่อ BT" : "Connect BT")}
                </button>
              </div>

              <div className="text-xs font-semibold text-[#0066FF] uppercase tracking-wider mt-4 mb-1">
                {language === "th" ? "ตั้งค่าเสียงและระบบพิมพ์" : "General Settings"}
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/60 border-zinc-700/60" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  {enabledMethods.soundEnabled ? <Volume2 className="text-[#0066FF]" size={18} /> : <VolumeX className="text-zinc-400" size={18} />}
                  <div>
                    <p className="text-xs font-medium">{language === "th" ? "เสียงปี๊บเมื่อสแกนสินค้า" : "Scan Sound Effect"}</p>
                    <p className="text-[10px] text-zinc-400">{language === "th" ? "เล่นเสียงสั้นๆ เมื่อเลือกสินค้า" : "Play beep sound on selection"}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledMethods.soundEnabled}
                  onChange={(e) => setEnabledMethods((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-[#0066FF] cursor-pointer"
                />
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/60 border-zinc-700/60" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <Printer className="text-[#0066FF]" size={18} />
                  <div>
                    <p className="text-xs font-medium">{language === "th" ? "พิมพ์ใบเสร็จอัตโนมัติ" : "Auto Print Receipt"}</p>
                    <p className="text-[10px] text-zinc-400">{language === "th" ? "พิมพ์ใบเสร็จทันทีหลังชำระเงิน" : "Print receipt automatically"}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledMethods.autoPrint}
                  onChange={(e) => setEnabledMethods((prev) => ({ ...prev, autoPrint: e.target.checked }))}
                  className="w-4 h-4 accent-[#0066FF] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewSale={() => {
          setIsReceiptModalOpen(false);
          setCart([]);
          setCompletedTransaction(null);
        }}
        transaction={completedTransaction}
        storeInfo={currentStoreInfo}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}