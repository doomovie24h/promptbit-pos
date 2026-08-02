"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  Globe,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Store,
  User,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
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

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

type DropdownType = "notification" | "store" | "user" | null;

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function Topbar() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [search, setSearch] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(navContainerRef, () => setActiveDropdown(null));

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;

        const json = await response.json();
        if (!mounted) return;

        setUser({
          id: json.data.id,
          email: json.data.email,
          store: json.data.store,
          stores: json.data.stores ?? [],
        });

        setNotifications([
          {
            id: "1",
            title: "ระบบพร้อมใช้งาน",
            description: "ยินดีต้อนรับสู่ Promptbit POS ระบบจัดการร้านค้าอัจฉริยะ",
            createdAt: "เพิ่งเกิดขึ้น",
            read: false,
          },
        ]);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const avatarInitial = useMemo(() => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  }, [user]);

  const toggleDropdown = (dropdown: DropdownType) => {
    setActiveDropdown((current) => (current === dropdown ? null : dropdown));
  };

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.replace("/login");
    router.refresh();
  }

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  function changeStore(store: StoreInfo) {
    setUser((current) => (current ? { ...current, store } : current));
    setActiveDropdown(null);
  }

  const toggleLanguage = () => {
    const currentLang = language ? String(language).toLowerCase() : "th";
    const nextLang = currentLang === "th" ? "en" : "th";
    if (typeof setLanguage === "function") {
      setLanguage(nextLang as any);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const bgColor = "#004741";
  const textColor = "#ffffff";
  const subTextColor = "#cbd5e1";
  const borderColor = "rgba(255, 255, 255, 0.15)";

  return (
    <header
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-xl transition-all lg:px-8"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      {/* --- Left: Branding & Current Store --- */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shadow-md lg:hidden"
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#ffffff",
          }}
        >
          <Store size={18} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight" style={{ color: textColor }}>
              Promptbit
            </span>
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
            >
              POS
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: subTextColor }}>
            {loading ? (
              <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
            ) : (
              <span className="max-w-[140px] truncate font-normal md:max-w-[200px]">
                {user?.store?.name ?? "ไม่ได้เลือกสาขา"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- Center: Modern Command Search Bar --- */}
      <div className="hidden flex-1 justify-center px-10 lg:flex">
        <div className="group relative w-full max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: subTextColor }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า, ออเดอร์, ลูกค้า..."
            className="h-9 w-full rounded-full pl-9 pr-12 text-xs transition-all duration-200 focus:outline-none focus:ring-4 placeholder:text-slate-300"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              color: textColor,
              border: `1px solid ${borderColor}`,
            }}
          />
          <div
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "#ffffff",
            }}
          >
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* --- Right: Controls & User Profile --- */}
      <div ref={navContainerRef} className="flex items-center gap-1.5 md:gap-2">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title="สลับภาษา"
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all hover:opacity-80 active:scale-95 cursor-pointer"
          style={{ color: textColor }}
        >
          <Globe size={15} style={{ color: subTextColor }} />
          <span className="uppercase">{String(language || "th")}</span>
        </button>

        {/* Theme Toggle Switcher */}
        <div className="flex items-center gap-2 px-1.5 py-1">
          <Switch
            checked={isDarkMode}
            onCheckedChange={handleThemeToggle}
            aria-label="Toggle Dark Mode"
          />
        </div>

        <div className="mx-1 h-4 w-px" style={{ backgroundColor: borderColor }} />

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("notification")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:opacity-80 active:scale-95 cursor-pointer"
            style={{ color: textColor }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400 ring-2 animate-pulse" />
            )}
          </button>

          {activeDropdown === "notification" && (
            <div className="absolute right-0 mt-2 w-80 animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-2xl border bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-semibold">การแจ้งเตือน</span>
                </div>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              <div className="max-h-[280px] overflow-y-auto p-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    ไม่มีการแจ้งเตือนใหม่
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/60"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Check size={13} />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground/60">{item.createdAt}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Store Switcher */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => toggleDropdown("store")}
            className="flex h-9 items-center gap-2 rounded-lg border px-2.5 transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderColor: borderColor,
              color: textColor,
            }}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="max-w-[110px] truncate text-xs font-medium">
              {user?.store?.name ?? "เลือกสาขา"}
            </span>
            <ChevronDown size={13} style={{ color: subTextColor }} />
          </button>

          {activeDropdown === "store" && (
            <div className="absolute right-0 mt-2 w-64 animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-2xl border bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-2xl">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                สลับสาขาร้านค้า
              </div>
              <div className="space-y-0.5">
                {(user?.stores ?? []).map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => changeStore(store)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/60 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{store.name}</p>
                      <p className="text-[10px] text-muted-foreground">{store.role}</p>
                    </div>
                    {user?.store?.id === store.id && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => toggleDropdown("user")}
            className="flex h-9 items-center gap-2 rounded-full border p-1 pr-2.5 transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderColor: borderColor,
              color: textColor,
            }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-xs"
              style={{
                backgroundColor: "#ffffff",
                color: "#004741",
              }}
            >
              {avatarInitial}
            </div>
            <span className="hidden max-w-[100px] truncate text-xs font-medium sm:inline-block">
              {user?.email ? user.email.split("@")[0] : "ผู้ใช้งาน"}
            </span>
            <ChevronDown size={13} className="hidden sm:inline-block" style={{ color: subTextColor }} />
          </button>

          {activeDropdown === "user" && (
            <div className="absolute right-0 mt-2 w-56 animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-2xl border bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-2xl">
              <div className="border-b px-3 py-2.5">
                <p className="truncate text-xs font-medium text-foreground">{user?.email}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.store?.name ?? "Promptbit User"}</p>
              </div>

              <div className="mt-1 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/60"
                >
                  <User size={14} className="text-muted-foreground" />
                  โปรไฟล์
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/60"
                >
                  <Settings size={14} className="text-muted-foreground" />
                  ตั้งค่าระบบ
                </Link>

                <div className="my-1 h-px bg-border/50" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15 cursor-pointer"
                >
                  <LogOut size={14} />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}