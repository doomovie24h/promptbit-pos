/**
 * @fileoverview Grocery & Retail Dashboard - Promptbit POS (Clean Enterprise Edition)
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
  Activity
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EDE4] dark:bg-[#171717] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3 text-zinc-700 dark:text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#004741] dark:text-[#21F1A8]" />
          <p className="text-xs font-medium tracking-wide">{t.loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0EDE4] dark:bg-[#171717] flex items-center justify-center p-6 transition-colors">
        <div className="bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] p-6 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.errorTitle}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#004741] dark:bg-[#21F1A8] text-white dark:text-black py-2.5 rounded-xl text-xs font-medium transition-all"
          >
            {t.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F0EDE4] dark:bg-[#171717] text-zinc-900 dark:text-zinc-100 transition-colors pb-24 sm:pb-12">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 space-y-6">
      
        {/* App Header & Real-time Status Bar */}
        <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Store Identity & Live Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-[#2b2b2b] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#333]">
                  <Store size={13} className="text-[#004741] dark:text-[#21F1A8]" />
                  <span>{t.subtitle}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ระบบพร้อมใช้งาน</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-1">
                {stats?.storeName || storeName || "ร้านค้าของฉัน"}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.desc}
              </p>
            </div>

            {/* Real-time Clock & Global Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-[#2f2f2f]">
              <div className="hidden md:flex items-center gap-2 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300">
                <Clock size={13} className="text-zinc-400" />
                <span>
                  {currentTime ? currentTime.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "--/--/----"} 
                  <span className="text-zinc-300 dark:text-zinc-600 mx-1.5">/</span>
                  <strong className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-zinc-300 dark:border-[#383838]"
                >
                  <Globe size={13} />
                  <span className="uppercase">{lang}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-300 w-8 h-8 rounded-lg transition-colors border border-zinc-300 dark:border-[#383838]"
                >
                  {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                </button>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-300 w-8 h-8 rounded-lg transition-colors border border-zinc-300 dark:border-[#383838]"
                >
                  <Settings size={14} />
                </button>
                <Link
                  href="/stores"
                  className="flex items-center justify-center bg-zinc-100 dark:bg-[#2b2b2b] hover:bg-zinc-200 dark:hover:bg-[#383838] text-zinc-700 dark:text-zinc-300 w-8 h-8 rounded-lg transition-colors border border-zinc-300 dark:border-[#383838]"
                  title={t.switchStore}
                >
                  <Repeat size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* POS Terminal Launch Button */}
          <Link
            href="/grocery/pos"
            className="w-full flex items-center justify-center gap-2.5 bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
          >
            <ScanBarcode size={18} />
            <span>{t.posButton}</span>
          </Link>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{t.todaySales}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                ฿{(stats?.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">จาก {stats?.todayOrderCount || 0} {t.todayOrders}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{t.totalProducts}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Package size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {(stats?.totalProducts || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t.stockTracked}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{t.lowStock}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{stats?.lowStockCount || 0}</h3>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 truncate">{t.lowStockAction}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{t.customers}</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {(stats?.totalCustomers || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t.members}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Low Stock Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-3 lg:col-span-1">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-[#004741] dark:text-[#21F1A8]" />
              <span>{t.quickActions}</span>
            </h2>
            <div className="space-y-2">
              <Link
                href="/grocery/products/new"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] hover:bg-zinc-100 dark:hover:bg-[#262626] border border-zinc-200 dark:border-[#2f2f2f] transition-colors text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-[#333] text-zinc-700 dark:text-zinc-300">
                    <Plus size={14} />
                  </div>
                  <div>
                    <span className="block font-medium">{t.addProd}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.addProdDesc}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/grocery/inventory"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] hover:bg-zinc-100 dark:hover:bg-[#262626] border border-zinc-200 dark:border-[#2f2f2f] transition-colors text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-[#333] text-zinc-700 dark:text-zinc-300">
                    <Package size={14} />
                  </div>
                  <div>
                    <span className="block font-medium">{t.inventory}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.inventoryDesc}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/grocery/customers"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] hover:bg-zinc-100 dark:hover:bg-[#262626] border border-zinc-200 dark:border-[#2f2f2f] transition-colors text-xs font-medium text-zinc-900 dark:text-zinc-100 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-[#333] text-zinc-700 dark:text-zinc-300">
                    <Users size={14} />
                  </div>
                  <div>
                    <span className="block font-medium">{t.custMgmt}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.custMgmtDesc}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#2f2f2f] p-5 rounded-2xl shadow-sm space-y-3 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span>{t.lowStockTitle}</span>
              </h2>
              <Link href="/grocery/inventory?filter=low-stock" className="text-xs font-medium text-[#004741] dark:text-[#21F1A8] hover:underline">
                {t.viewAll}
              </Link>
            </div>

            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-[#2f2f2f] text-zinc-400 font-medium uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 font-medium">ชื่อสินค้า</th>
                      <th className="pb-3 font-medium">{t.price}</th>
                      <th className="pb-3 font-medium text-right">{t.remaining}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-[#262626]">
                    {stats.lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-[#262626]/50 transition-colors">
                        <td className="py-3 text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[200px]">{item.name}</td>
                        <td className="py-3 text-zinc-500 dark:text-zinc-400 font-mono">฿{item.price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
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
                <CheckCircle2 className="w-6 h-6 text-emerald-500/80" />
                <span>{t.noLowStock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom App Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md border-t border-zinc-200 dark:border-[#2f2f2f] px-4 py-2 flex sm:hidden items-center justify-around shadow-lg">
          <Link href="/grocery/dashboard" className="flex flex-col items-center gap-1 text-[#004741] dark:text-[#21F1A8]">
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-medium">หน้าแรก</span>
          </Link>
          <Link href="/grocery/pos" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ScanBarcode size={18} />
            <span className="text-[10px] font-medium">POS</span>
          </Link>
          <Link href="/grocery/inventory" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Boxes size={18} />
            <span className="text-[10px] font-medium">คลังสินค้า</span>
          </Link>
          <Link href="/grocery/customers" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Users size={18} />
            <span className="text-[10px] font-medium">ลูกค้า</span>
          </Link>
        </div>

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#212121] border border-zinc-300 dark:border-[#333] w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-[#2f2f2f] pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.settingsTitle}</h2>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-[#2b2b2b] rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={13} className="text-zinc-400" /> {t.storeProfile}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.storeNameLabel}</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.ownerNameLabel}</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.phoneLabel}</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.taxLabel}</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-zinc-200 dark:border-[#2f2f2f]">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-zinc-400" /> {t.paymentSettings}
                  </h3>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      {t.promptPayLabel}
                    </label>
                    <input
                      type="text"
                      value={promptPayNumber}
                      onChange={(e) => setPromptPayNumber(e.target.value)}
                      placeholder="เช่น 0620467472"
                      className="w-full bg-zinc-50 dark:bg-[#171717] border border-zinc-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t.paymentMethods}</label>

                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-[#171717] px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-[#333]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200">{t.cashMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.cash}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, cash: e.target.checked })}
                        className="w-4 h-4 accent-[#004741] dark:accent-[#21F1A8] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-[#171717] px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-[#333]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200">{t.qrMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.promptpay}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, promptpay: e.target.checked })}
                        className="w-4 h-4 accent-[#004741] dark:accent-[#21F1A8] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-[#171717] px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-[#333]">
                      <span className="text-xs text-zinc-900 dark:text-zinc-200">{t.creditMethod}</span>
                      <input
                        type="checkbox"
                        checked={enabledMethods.credit}
                        onChange={(e) => setEnabledMethods({ ...enabledMethods, credit: e.target.checked })}
                        className="w-4 h-4 accent-[#004741] dark:accent-[#21F1A8] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={saveSettings}
                  className="w-full bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black font-medium py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} />
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