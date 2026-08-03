/**
 * @fileoverview Grocery & Retail Dashboard - Promptbit POS (Bangkok Bank Enterprise Edition)
 * @module app/grocery/dashboard/page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Plus, 
  ScanBarcode, 
  ArrowRight, 
  Loader2,
  Store,
  Repeat,
  Settings,
  Sun,
  Moon,
  Globe,
  X,
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Boxes,
  Clock,
  Activity,
  Bluetooth,
  Usb,
  Printer,
  RefreshCcw,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { translations } from "./translations";

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface DashboardStats {
  storeName: string;
  ownerName?: string;
  storePhone?: string;
  taxId?: string;
  promptPayNumber?: string;
  enabledMethods?: {
    cash: boolean;
    promptpay: boolean;
    credit: boolean;
  };
  totalProducts: number;
  lowStockCount: number;
  lowStockItems: LowStockItem[];
  totalCustomers: number;
  todaySales: number;
  todayOrderCount: number;
}

export default function GroceryDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<"th" | "en">("th");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Hardware Connection States (USB & Bluetooth)
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string | null>(null);
  const [usbConnected, setUsbConnected] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState<string | null>(null);
  const [isConnectingBt, setIsConnectingBt] = useState(false);
  const [isConnectingUsb, setIsConnectingUsb] = useState(false);

  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [promptPayNumber, setPromptPayNumber] = useState("");
  const [enabledMethods, setEnabledMethods] = useState({
    cash: true,
    promptpay: true,
    credit: true,
  });

  const t = translations[lang];

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("pos_theme");
      const shouldUseDark = savedTheme ? savedTheme === "dark" : true;
      
      setIsDarkMode(shouldUseDark);
      if (shouldUseDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedLang = localStorage.getItem("pos_lang") as "th" | "en";
      if (savedLang) setLang(savedLang);
    }

    async function fetchStats() {
      try {
        const res = await fetch("/api/grocery/stats");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        }

        const data: DashboardStats = json.data;
        setStats(data);

        if (data) {
          if (data.storeName) setStoreName(data.storeName);
          if (data.ownerName) setOwnerName(data.ownerName);
          if (data.storePhone) setStorePhone(data.storePhone);
          if (data.taxId) setTaxId(data.taxId);
          if (data.promptPayNumber) setPromptPayNumber(data.promptPayNumber);
          if (data.enabledMethods) setEnabledMethods(data.enabledMethods);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("pos_theme", nextMode ? "dark" : "light");
    
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "th" ? "en" : "th";
    setLang(nextLang);
    localStorage.setItem("pos_lang", nextLang);
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/grocery/store/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          ownerName,
          storePhone,
          taxId,
          promptPayNumber,
          enabledMethods,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      setStats((prev) => prev ? { ...prev, storeName } : null);
      setIsSettingsModalOpen(false);
      toast.success(lang === "th" ? "บันทึกการตั้งค่าเรียบร้อยแล้ว" : "Settings saved successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    }
  };

  // Connect Bluetooth Device (Printer / Scanner)
  const handleConnectBluetooth = async () => {
    setIsConnectingBt(true);
    try {
      if (typeof navigator !== "undefined" && "bluetooth" in navigator) {
        // @ts-expect-error - navigator.bluetooth is experimental web API
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        });
        setBluetoothDeviceName(device.name || "Bluetooth Thermal Printer");
        setBluetoothConnected(true);
        toast.success(lang === "th" ? `เชื่อมต่อบลูทูธสำเร็จ: ${device.name || "Printer"}` : "Bluetooth connected successfully");
      } else {
        // Fallback simulation for desktop/browsers without Web Bluetooth support
        await new Promise((r) => setTimeout(r, 1500));
        setBluetoothDeviceName("POS-Printer-BT (Mock)");
        setBluetoothConnected(true);
        toast.success(lang === "th" ? "เชื่อมต่ออุปกรณ์ Bluetooth สำเร็จ (โหมดจำลอง)" : "Bluetooth Connected (Simulated)");
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "th" ? "ไม่สามารถเชื่อมต่อบลูทูธได้ หรือผู้ใช้ยกเลิก" : "Bluetooth connection cancelled or failed");
    } finally {
      setIsConnectingBt(false);
    }
  };

  // Connect USB Device (Barcode Scanner / ESC/POS Printer)
  const handleConnectUSB = async () => {
    setIsConnectingUsb(true);
    try {
      if (typeof navigator !== "undefined" && "usb" in navigator) {
        // @ts-expect-error - navigator.usb is experimental web API
        const device = await navigator.usb.requestDevice({ filters: [] });
        setUsbDeviceName(device.productName || "USB POS Barcode Scanner");
        setUsbConnected(true);
        toast.success(lang === "th" ? `เชื่อมต่อ USB สำเร็จ: ${device.productName || "Scanner"}` : "USB connected successfully");
      } else {
        // Fallback simulation
        await new Promise((r) => setTimeout(r, 1500));
        setUsbDeviceName("USB Barcode Scanner HID (Mock)");
        setUsbConnected(true);
        toast.success(lang === "th" ? "เชื่อมต่ออุปกรณ์ USB สำเร็จ (โหมดจำลอง)" : "USB Connected (Simulated)");
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "th" ? "ไม่สามารถเชื่อมต่อ USB ได้ หรือผู้ใช้ยกเลิก" : "USB connection cancelled or failed");
    } finally {
      setIsConnectingUsb(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0F1117] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3 text-zinc-700 dark:text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
          <p className="text-xs font-medium tracking-wide">{t.loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0F1117] flex items-center justify-center p-6 transition-colors">
        <div className="bg-white dark:bg-[#181B25] border border-zinc-200 dark:border-[#2A2E3D] p-6 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.errorTitle}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-2.5 rounded-xl text-xs font-medium transition-all shadow-md shadow-[#0066FF]/20"
          >
            {t.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] dark:bg-[#0F1117] text-zinc-900 dark:text-zinc-100 transition-colors pb-24 sm:pb-12 selection:bg-[#0066FF] selection:text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
        {/* App Header & Real-time Status Bar (Bangkok Bank Inspired & Responsive Mac/PC/Mobile Layout) */}
        <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 sm:p-7 rounded-3xl shadow-sm dark:shadow-none space-y-5 relative overflow-hidden">
          {/* Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0066FF] via-[#3385FF] to-[#CCE0FF]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Store Identity & Live Status */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#CCE0FF]/50 dark:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#66A3FF] border border-[#0066FF]/20">
                  <Store size={13} className="text-[#0066FF]" />
                  <span>{t.subtitle}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ระบบพร้อมใช้งาน (Online)</span>
                </span>
                {(bluetoothConnected || usbConnected) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-[#0066FF] dark:text-blue-400">
                    <Check size={12} />
                    <span>เชื่อมต่อฮาร์ดแวร์แล้ว</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white pt-1">
                {stats?.storeName || storeName || "ร้านค้าของฉัน"}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
                {t.desc} ระบบบริหารจัดการร้านค้ายุคใหม่ รองรับการใช้งานเต็มรูปแบบบนมือถือ, iPad, MacBook และ PC
              </p>
            </div>

            {/* Real-time Clock & Global Controls */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-[#2A2E3D]">
              <div className="flex items-center gap-2 bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100/60 dark:border-[#2A2E3D] px-3.5 py-2 rounded-2xl text-xs font-mono text-zinc-600 dark:text-zinc-300 shadow-inner">
                <Clock size={14} className="text-[#0066FF]" />
                <span>
                  {currentTime ? currentTime.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "--/--/----"} 
                  <span className="text-zinc-300 dark:text-zinc-600 mx-1.5">|</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Hardware Connection Button */}
                <button
                  onClick={() => setIsDeviceModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#CCE0FF]/60 hover:bg-[#CCE0FF] dark:bg-[#0066FF]/20 dark:hover:bg-[#0066FF]/30 text-[#0066FF] dark:text-[#66A3FF] px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-[#0066FF]/30"
                  title="เชื่อมต่อ USB / Bluetooth"
                >
                  <Bluetooth size={14} />
                  <span className="hidden sm:inline">อุปกรณ์</span>
                </button>

                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 bg-zinc-100 dark:bg-[#252A3A] hover:bg-zinc-200 dark:hover:bg-[#32384C] text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors border border-zinc-200 dark:border-[#2A2E3D]"
                >
                  <Globe size={14} className="text-[#0066FF]" />
                  <span className="uppercase font-semibold">{lang}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#252A3A] hover:bg-zinc-200 dark:hover:bg-[#32384C] text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-[#2A2E3D]"
                >
                  {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[#0066FF]" />}
                </button>

                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#252A3A] hover:bg-zinc-200 dark:hover:bg-[#32384C] text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-[#2A2E3D]"
                >
                  <Settings size={15} />
                </button>

                <Link
                  href="/stores"
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#252A3A] hover:bg-zinc-200 dark:hover:bg-[#32384C] text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-[#2A2E3D]"
                  title={t.switchStore}
                >
                  <Repeat size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* POS Terminal Launch Button (Bangkok Bank Signature Blue Action) */}
          <Link
            href="/grocery/pos"
            className="w-full flex items-center justify-center gap-3 bg-[#0066FF] hover:bg-[#0052CC] text-white py-4 px-6 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[#0066FF]/25 active:scale-[0.99]"
          >
            <ScanBarcode size={20} />
            <span>{t.posButton}</span>
          </Link>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group hover:border-[#0066FF]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.todaySales}</span>
              <div className="w-9 h-9 rounded-xl bg-[#CCE0FF]/60 dark:bg-[#0066FF]/20 text-[#0066FF] flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                ฿{(stats?.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">จาก {stats?.todayOrderCount || 0} {t.todayOrders}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group hover:border-[#0066FF]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.totalProducts}</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(stats?.totalProducts || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.stockTracked}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.lowStock}</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stats?.lowStockCount || 0}</h3>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">{t.lowStockAction}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.customers}</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(stats?.totalCustomers || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.members}</p>
            </div>
          </div>

        </div>

        {/* Quick Actions & Low Stock Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 sm:p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-[#0066FF]" />
              <span>{t.quickActions}</span>
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/grocery/products/new"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#12141C] hover:bg-blue-50/50 dark:hover:bg-[#1E2333] border border-blue-100/50 dark:border-[#2A2E3D] transition-all text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#CCE0FF]/60 dark:bg-[#0066FF]/20 text-[#0066FF]">
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.addProd}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.addProdDesc}</span>
                  </div>
                </div>
                <ArrowRight size={15} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/grocery/inventory"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#12141C] hover:bg-blue-50/50 dark:hover:bg-[#1E2333] border border-blue-100/50 dark:border-[#2A2E3D] transition-all text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Package size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.inventory}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.inventoryDesc}</span>
                  </div>
                </div>
                <ArrowRight size={15} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/grocery/customers"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#12141C] hover:bg-blue-50/50 dark:hover:bg-[#1E2333] border border-blue-100/50 dark:border-[#2A2E3D] transition-all text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.custMgmt}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.custMgmtDesc}</span>
                  </div>
                </div>
                <ArrowRight size={15} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] p-5 sm:p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                <span>{t.lowStockTitle}</span>
              </h2>
              <Link href="/grocery/inventory?filter=low-stock" className="text-xs font-semibold text-[#0066FF] hover:underline">
                {t.viewAll}
              </Link>
            </div>

            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-100 dark:border-[#2A2E3D] text-zinc-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 font-semibold">ชื่อสินค้า</th>
                      <th className="pb-3 font-semibold">{t.price}</th>
                      <th className="pb-3 font-semibold text-right">{t.remaining}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-[#222738]">
                    {stats.lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-[#1E2333]/50 transition-colors">
                        <td className="py-3.5 text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[220px]">{item.name}</td>
                        <td className="py-3.5 text-zinc-500 dark:text-zinc-400 font-mono">฿{item.price.toFixed(2)}</td>
                        <td className="py-3.5 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {item.stock} ชิ้น
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-xs font-normal flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
                <span>{t.noLowStock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom App Navigation Bar (Optimized for Mobile App Experience) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181B25]/95 backdrop-blur-md border-t border-blue-100 dark:border-[#2A2E3D] px-4 py-2.5 flex sm:hidden items-center justify-around shadow-xl">
          <Link href="/grocery/dashboard" className="flex flex-col items-center gap-1 text-[#0066FF]">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">หน้าแรก</span>
          </Link>
          <Link href="/grocery/pos" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ScanBarcode size={20} />
            <span className="text-[10px] font-medium">POS</span>
          </Link>
          <Link href="/grocery/inventory" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Boxes size={20} />
            <span className="text-[10px] font-medium">คลังสินค้า</span>
          </Link>
          <Link href="/grocery/customers" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Users size={20} />
            <span className="text-[10px] font-medium">ลูกค้า</span>
          </Link>
        </div>

        {/* Hardware & Device Connection Modal (USB & Bluetooth) */}
        {isDeviceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-[#2A2E3D] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#CCE0FF]/60 dark:bg-[#0066FF]/20 text-[#0066FF]">
                    <Bluetooth size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">เชื่อมต่ออุปกรณ์ฮาร์ดแวร์</h2>
                    <p className="text-[11px] text-zinc-500">รองรับเครื่องพิมพ์ใบเสร็จ, เครื่องสแกนบาร์โค้ด ผ่าน USB & Bluetooth</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-[#252A3A] rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Bluetooth Device Section */}
                <div className="bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Bluetooth size={16} className="text-[#0066FF]" />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">บลูทูธ (Bluetooth Printer)</h3>
                        <p className="text-[11px] text-zinc-500">
                          {bluetoothConnected ? `เชื่อมต่อแล้ว: ${bluetoothDeviceName}` : "ยังไม่ได้เชื่อมต่ออุปกรณ์"}
                        </p>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${bluetoothConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  </div>

                  <button
                    onClick={handleConnectBluetooth}
                    disabled={isConnectingBt}
                    className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isConnectingBt ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                    <span>{bluetoothConnected ? "เชื่อมต่อใหม่อีกครั้ง" : "ค้นหาและเชื่อมต่อบลูทูธ"}</span>
                  </button>
                </div>

                {/* USB Device Section */}
                <div className="bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Usb size={16} className="text-[#0066FF]" />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">ยูเอสบี (USB Scanner / Printer)</h3>
                        <p className="text-[11px] text-zinc-500">
                          {usbConnected ? `เชื่อมต่อแล้ว: ${usbDeviceName}` : "ยังไม่ได้เชื่อมต่อพอร์ต USB"}
                        </p>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${usbConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  </div>

                  <button
                    onClick={handleConnectUSB}
                    disabled={isConnectingUsb}
                    className="w-full bg-zinc-900 dark:bg-[#252A3A] hover:bg-zinc-800 dark:hover:bg-[#32384C] text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isConnectingUsb ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                    <span>{usbConnected ? "เชื่อมต่อ USB ใหม่อีกครั้ง" : "เชื่อมต่ออุปกรณ์ USB"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="w-full bg-[#CCE0FF]/60 hover:bg-[#CCE0FF] dark:bg-[#252A3A] text-[#0066FF] dark:text-white font-semibold py-3 rounded-xl text-xs transition-all"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-[#2A2E3D] pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-[#0066FF]" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{t.settingsTitle}</h2>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-[#252A3A] rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={14} className="text-[#0066FF]" /> {t.storeProfile}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.storeNameLabel}</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.ownerNameLabel}</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.phoneLabel}</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.taxLabel}</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-[#2A2E3D]">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#0066FF]" /> {t.paymentSettings}
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      {t.promptPayLabel}
                    </label>
                    <input
                      type="text"
                      value={promptPayNumber}
                      onChange={(e) => setPromptPayNumber(e.target.value)}
                      placeholder="เช่น 0620467472"
                      className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0066FF] dark:text-blue-400 focus:outline-none focus:border-[#0066FF] transition-colors"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-zinc-500">{t.paymentMethods}</label>

                    <div className="flex items-center justify-between bg-[#F4F7FB] dark:bg-[#12141C] px-4 py-2.5 rounded-xl border border-blue-100 dark:border-[#2A2E3D]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200 font-medium">{t.cashMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.cash}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, cash: e.target.checked })}
                        className="w-4 h-4 accent-[#0066FF] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#F4F7FB] dark:bg-[#12141C] px-4 py-2.5 rounded-xl border border-blue-100 dark:border-[#2A2E3D]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200 font-medium">{t.qrMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.promptpay}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, promptpay: e.target.checked })}
                        className="w-4 h-4 accent-[#0066FF] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#F4F7FB] dark:bg-[#12141C] px-4 py-2.5 rounded-xl border border-blue-100 dark:border-[#2A2E3D]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200 font-medium">{t.creditMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.credit}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, credit: e.target.checked })}
                        className="w-4 h-4 accent-[#0066FF] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={saveSettings}
                  className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-[#0066FF]/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{t.saveBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}