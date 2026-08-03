/**
 * @fileoverview Grocery & Retail Dashboard - Promptbit POS
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
  Check,
  Camera
} from "lucide-react";
import { toast } from "sonner";
import { translations } from "./translations";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Hardware Connection States
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

  const handleConnectBluetooth = async () => {
    setIsConnectingBt(true);
    try {
      if (typeof navigator !== "undefined" && "bluetooth" in navigator) {
        // @ts-expect-error - Web Bluetooth API
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        });
        setBluetoothDeviceName(device.name || "Bluetooth Thermal Printer");
        setBluetoothConnected(true);
        toast.success(lang === "th" ? `เชื่อมต่อบลูทูธสำเร็จ: ${device.name || "Printer"}` : "Bluetooth connected");
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setBluetoothDeviceName("POS-Thermal-BT (Simulated)");
        setBluetoothConnected(true);
        toast.success(lang === "th" ? "เชื่อมต่อบลูทูธสำเร็จ (โหมดจำลอง)" : "Bluetooth Connected (Mock)");
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "th" ? "ยกเลิกหรือเชื่อมต่อบลูทูธไม่สำเร็จ" : "Bluetooth connection cancelled");
    } finally {
      setIsConnectingBt(false);
    }
  };

  const handleConnectUSB = async () => {
    setIsConnectingUsb(true);
    try {
      if (typeof navigator !== "undefined" && "usb" in navigator) {
        // @ts-expect-error - Web USB API
        const device = await navigator.usb.requestDevice({ filters: [] });
        setUsbDeviceName(device.productName || "USB POS Hardware");
        setUsbConnected(true);
        toast.success(lang === "th" ? `เชื่อมต่อ USB สำเร็จ: ${device.productName}` : "USB connected");
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setUsbDeviceName("USB Barcode Scanner HID (Simulated)");
        setUsbConnected(true);
        toast.success(lang === "th" ? "เชื่อมต่อ USB สำเร็จ (โหมดจำลอง)" : "USB Connected (Mock)");
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "th" ? "ยกเลิกหรือเชื่อมต่อ USB ไม่สำเร็จ" : "USB connection cancelled");
    } finally {
      setIsConnectingUsb(false);
    }
  };

  const handleScannedResult = (barcode: string) => {
    router.push(`/grocery/pos?search=${encodeURIComponent(barcode)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0A0D14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-600 dark:text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
          <p className="text-xs font-medium">{t.loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0A0D14] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{t.errorTitle}</h2>
          <p className="text-xs text-zinc-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0066FF] text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
          >
            {t.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F2F6FA] dark:bg-[#090C12] text-zinc-900 dark:text-zinc-100 transition-colors pb-24 sm:pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0066FF]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-[#0066FF] dark:text-blue-400">
                  <Store size={13} />
                  <span>{t.subtitle}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ระบบออนไลน์พร้อมใช้งาน</span>
                </span>
                {(bluetoothConnected || usbConnected) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-[#0066FF] dark:text-blue-400">
                    <Check size={12} />
                    <span>ฮาร์ดแวร์เชื่อมต่อแล้ว</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {stats?.storeName || storeName || "ร้านค้าของฉัน"}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
                ระบบจัดการร้านค้าและจุดขาย POS รองรับการใช้งานบนมือถือ แท็บเล็ต และคอมพิวเตอร์ พร้อมระบบกล้องสแกนบาร์โค้ดในตัว
              </p>
            </div>

            {/* Quick Control Tools & Clock */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-2xl text-xs font-mono text-zinc-600 dark:text-zinc-300">
                <Clock size={14} className="text-[#0066FF]" />
                <span>
                  {currentTime ? currentTime.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "--/--/----"} 
                  <span className="mx-1.5 opacity-40">|</span>
                  <strong className="text-zinc-900 dark:text-white font-semibold">
                    {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDeviceModalOpen(true)}
                  className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                  title="อุปกรณ์ USB / Bluetooth"
                >
                  <Bluetooth size={14} />
                  <span className="hidden sm:inline">อุปกรณ์</span>
                </button>

                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <Globe size={14} className="text-[#0066FF]" />
                  <span className="uppercase font-bold">{lang}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[#0066FF]" />}
                </button>

                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <Settings size={15} />
                </button>

                <Link
                  href="/stores"
                  className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 w-9 h-9 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700"
                  title={t.switchStore}
                >
                  <Repeat size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Action Hub Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/grocery/pos"
              className="flex items-center justify-center gap-3 bg-[#0066FF] hover:bg-blue-700 text-white py-4 px-6 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99]"
            >
              <ScanBarcode size={20} />
              <span>{t.posButton}</span>
            </Link>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center justify-center gap-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 py-4 px-6 rounded-2xl text-sm font-bold transition-all active:scale-[0.99]"
            >
              <Camera size={20} className="text-[#0066FF]" />
              <span>{lang === "th" ? "เปิดกล้องสแกนบาร์โค้ดด่วน" : "Quick Camera Scanner"}</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-[#0066FF] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.todaySales}</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#0066FF] flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                ฿{(stats?.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">จาก {stats?.todayOrderCount || 0} {t.todayOrders}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-[#0066FF] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.totalProducts}</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {(stats?.totalProducts || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{t.stockTracked}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.lowStock}</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{stats?.lowStockCount || 0}</h3>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">{t.lowStockAction}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.customers}</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {(stats?.totalCustomers || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{t.members}</p>
            </div>
          </div>

        </div>

        {/* Quick Management & Low Stock Inventory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
            <h2 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#0066FF]" />
              <span>{t.quickActions}</span>
            </h2>
            <div className="space-y-3">
              <Link
                href="/grocery/products/new"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all text-xs font-semibold text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0066FF]">
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.addProd}</span>
                    <span className="text-[11px] text-zinc-500">{t.addProdDesc}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/grocery/inventory"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all text-xs font-semibold text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                    <Package size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.inventory}</span>
                    <span className="text-[11px] text-zinc-500">{t.inventoryDesc}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/grocery/customers"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all text-xs font-semibold text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="block font-bold">{t.custMgmt}</span>
                    <span className="text-[11px] text-zinc-500">{t.custMgmtDesc}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>{t.lowStockTitle}</span>
              </h2>
              <Link href="/grocery/inventory?filter=low-stock" className="text-xs font-bold text-[#0066FF] hover:underline">
                {t.viewAll}
              </Link>
            </div>

            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="pb-3">ชื่อสินค้า</th>
                      <th className="pb-3">{t.price}</th>
                      <th className="pb-3 text-right">{t.remaining}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {stats.lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3.5 text-zinc-900 dark:text-zinc-100 font-bold truncate max-w-[220px]">{item.name}</td>
                        <td className="py-3.5 text-zinc-500 font-mono">฿{item.price.toFixed(2)}</td>
                        <td className="py-3.5 text-right">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {item.stock} ชิ้น
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>{t.noLowStock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom App Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121622]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex sm:hidden items-center justify-around shadow-2xl">
          <Link href="/grocery/dashboard" className="flex flex-col items-center gap-1 text-[#0066FF]">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">หน้าแรก</span>
          </Link>
          <Link href="/grocery/pos" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ScanBarcode size={20} />
            <span className="text-[10px] font-medium">POS</span>
          </Link>
          <button onClick={() => setIsScannerOpen(true)} className="flex flex-col items-center gap-1 text-[#0066FF]">
            <Camera size={20} />
            <span className="text-[10px] font-bold">สแกน</span>
          </button>
          <Link href="/grocery/inventory" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <Boxes size={20} />
            <span className="text-[10px] font-medium">คลัง</span>
          </Link>
          <Link href="/grocery/customers" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <Users size={20} />
            <span className="text-[10px] font-medium">ลูกค้า</span>
          </Link>
        </div>

        {/* Real Camera Barcode Scanner Modal Integration */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScannedResult}
          lang={lang}
        />

        {/* Hardware & Device Connection Modal */}
        {isDeviceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0066FF]">
                    <Bluetooth size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">เชื่อมต่อฮาร์ดแวร์ภายนอก</h2>
                    <p className="text-[11px] text-zinc-500">พิมพ์ใบเสร็จผ่าน Bluetooth & USB Scanner</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Bluetooth size={16} className="text-[#0066FF]" />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">เครื่องพิมพ์ Bluetooth</h3>
                        <p className="text-[11px] text-zinc-500">{bluetoothConnected ? `เชื่อมต่อแล้ว: ${bluetoothDeviceName}` : "ยังไม่ได้เชื่อมต่อ"}</p>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${bluetoothConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  </div>
                  <button
                    onClick={handleConnectBluetooth}
                    disabled={isConnectingBt}
                    className="w-full bg-[#0066FF] hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {isConnectingBt ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                    <span>{bluetoothConnected ? "เชื่อมต่อใหม่อีกครั้ง" : "ค้นหาและเชื่อมต่อบลูทูธ"}</span>
                  </button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Usb size={16} className="text-[#0066FF]" />
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">เครื่องสแกน/พิมพ์ USB</h3>
                        <p className="text-[11px] text-zinc-500">{usbConnected ? `เชื่อมต่อแล้ว: ${usbDeviceName}` : "ยังไม่ได้เชื่อมต่อพอร์ต USB"}</p>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${usbConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  </div>
                  <button
                    onClick={handleConnectUSB}
                    disabled={isConnectingUsb}
                    className="w-full bg-zinc-900 dark:bg-zinc-800 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {isConnectingUsb ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                    <span>{usbConnected ? "เชื่อมต่อ USB ใหม่อีกครั้ง" : "เชื่อมต่อพอร์ต USB"}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3 rounded-xl text-xs"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#121622] border border-zinc-200 dark:border-zinc-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-[#0066FF]" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{t.settingsTitle}</h2>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl"
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
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.ownerNameLabel}</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.phoneLabel}</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.taxLabel}</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#0066FF]" /> {t.paymentSettings}
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{t.promptPayLabel}</label>
                    <input
                      type="text"
                      value={promptPayNumber}
                      onChange={(e) => setPromptPayNumber(e.target.value)}
                      placeholder="เช่น 0620467472"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0066FF] dark:text-blue-400 focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={saveSettings}
                  className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
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