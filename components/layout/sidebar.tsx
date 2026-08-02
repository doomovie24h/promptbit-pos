"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Users,
  ChefHat,
  BarChart3,
  Settings,
  LogOut,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

type StoreInfo = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type UserInfo = {
  id: string;
  email: string;
  store: StoreInfo | null;
  stores: StoreInfo[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const json = await response.json();
        setUser({
          id: json.data.id,
          email: json.data.email,
          store: json.data.store,
          stores: json.data.stores ?? [],
        });
      } catch (error) {
        console.error("Failed to load profile in sidebar:", error);
      }
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  }

  const bgColor = "#004741";
  const textColor = "#ffffff";
  const mutedTextColor = "#cbd5e1";
  const borderColor = "rgba(255, 255, 255, 0.15)";
  const activeBg = "#ffffff";
  const activeText = "#004741";
  const hoverBg = "rgba(255, 255, 255, 0.1)";

  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
        { name: "ระบบแคชเชียร์", href: "/cashier", icon: ShoppingCart }, // แก้ไขจาก /pos เป็น /cashier
        { name: "การจัดการออเดอร์", href: "/orders", icon: ClipboardList },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "จัดการสินค้า", href: "/products", icon: Package },
        { name: "จัดการลูกค้า", href: "/customers", icon: Users },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { name: "ระบบหน้าครัว", href: "/kitchen", icon: ChefHat },
        { name: "รายงานและสถิติ", href: "/reports", icon: BarChart3 },
      ],
    },
  ];

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none border-r ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: borderColor,
      }}
    >
      {/* Header / Brand */}
      <div
        className="flex items-center justify-between px-4 h-16 border-b"
        style={{ borderColor: borderColor }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
            >
              <Store size={18} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight truncate" style={{ color: textColor }}>
                Promptbit POS
              </span>
              <span className="text-[10px] truncate" style={{ color: mutedTextColor }}>
                POS SaaS Platform
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#ffffff",
            }}
          >
            <Store size={18} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80 cursor-pointer"
          style={{ color: mutedTextColor }}
          title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Store Box */}
      {!collapsed && (
        <div className="p-3">
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl border"
            style={{
              borderColor: borderColor,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
            >
              <Store size={16} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: mutedTextColor }}>
                ข้อมูลร้านค้า
              </span>
              <span className="text-xs font-semibold truncate" style={{ color: textColor }}>
                {user?.store?.name ?? "กำลังโหลดร้านค้า..."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p
                className="px-3 text-[10px] font-bold tracking-wider uppercase mb-1"
                style={{ color: mutedTextColor }}
              >
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    collapsed ? "justify-center" : ""
                  }`}
                  style={{
                    backgroundColor: isActive ? activeBg : "transparent",
                    color: isActive ? activeText : textColor,
                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? activeText : textColor }} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Workspace Block */}
        {!collapsed && (
          <div
            className="p-3 rounded-2xl border space-y-2 mt-4"
            style={{
              borderColor: borderColor,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: mutedTextColor }}>
              WORKSPACE
            </p>
            <div className="flex items-center justify-between text-xs py-1">
              <span style={{ color: textColor }}>Language</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                }}
              >
                {String(language || "th")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span style={{ color: textColor }}>Stores</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                }}
              >
                {user?.stores?.length ?? 1}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer (Settings & Logout) */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: borderColor }}>
        <Link
          href="/settings"
          title={collapsed ? "ตั้งค่าระบบ" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: textColor }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Settings size={18} />
          {!collapsed && <span>ตั้งค่าระบบ</span>}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-red-300 hover:bg-red-500/20 cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}