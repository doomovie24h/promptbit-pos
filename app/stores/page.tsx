"use client";

import { useEffect, useState, FormEvent, Suspense, MouseEvent } from "react";
import {
  Plus,
  ArrowRight,
  ShoppingCart,
  Coffee,
  ChefHat,
  Loader2,
  Store as StoreIcon,
  Link as LinkIcon,
  RefreshCw,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  QrCode,
  CreditCard,
  Building2,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Store {
  id: string;
  name: string;
  description?: string | null;
  businessType?: string;
  slug?: string;
  role?: string;
  address?: string | null;
  promptpayId?: string | null;
  bankName?: string | null;
  accountName?: string | null;
}

interface BusinessTypeOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeColor: string;
  activeCardColor: string;
}

// ==========================================
// CONSTANTS & HELPERS
// ==========================================

const BUSINESS_TYPES: BusinessTypeOption[] = [
  {
    id: "grocery",
    label: "โชห่วย / ค้าปลีก",
    description: "เน้นระบบสแกนบาร์โค้ด & สต็อก",
    icon: ShoppingCart,
    badgeColor:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    activeCardColor:
      "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "cafe",
    label: "คาเฟ่",
    description: "เน้นระบบจัดการเครื่องดื่ม & คิว",
    icon: Coffee,
    badgeColor:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    activeCardColor:
      "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400",
  },
  {
    id: "restaurant",
    label: "ร้านอาหาร",
    description: "เน้นระบบจัดการโต๊ะ & ออเดอร์",
    icon: ChefHat,
    badgeColor:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    activeCardColor:
      "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400",
  },
];

const BANK_OPTIONS = [
  "กสิกรไทย (KBANK)",
  "ไทยพาณิชย์ (SCB)",
  "กรุงเทพ (BBL)",
  "กรุงไทย (KTB)",
  "กรุงศรีอยุธยา (BAY)",
  "ทหารไทยธนชาต (TTB)",
  "ออมสิน (GSB)",
  "เพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)",
  "อื่นๆ",
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBusinessTypeBadge(type?: string) {
  const found = BUSINESS_TYPES.find(
    (b) => b.id === type?.toLowerCase() || b.label === type
  );

  if (found) {
    return { label: found.label, color: found.badgeColor };
  }

  return {
    label: type || "ทั่วไป",
    color:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  };
}

// ==========================================
// MAIN CONTENT COMPONENT
// ==========================================

function StoresContent() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Search & Form visibility
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // Form states - General
  const [newStoreName, setNewStoreName] = useState<string>("");
  const [newStoreSlug, setNewStoreSlug] = useState<string>("");
  const [newStoreDesc, setNewStoreDesc] = useState<string>("");
  const [selectedBusinessType, setSelectedBusinessType] =
    useState<string>("grocery");

  // Form states - Location & Payment (New)
  const [newStoreAddress, setNewStoreAddress] = useState<string>("");
  const [newStorePromptPay, setNewStorePromptPay] = useState<string>("");
  const [newStoreBankName, setNewStoreBankName] = useState<string>("");
  const [newStoreAccountName, setNewStoreAccountName] = useState<string>("");

  const handleNameChange = (val: string) => {
    setNewStoreName(val);
    setNewStoreSlug(generateSlug(val));
  };

  const handleResetForm = () => {
    setNewStoreName("");
    setNewStoreSlug("");
    setNewStoreDesc("");
    setSelectedBusinessType("grocery");
    setNewStoreAddress("");
    setNewStorePromptPay("");
    setNewStoreBankName("");
    setNewStoreAccountName("");
  };

  async function loadStores() {
    try {
      setLoading(true);
      const res = await fetch("/api/stores", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "ไม่สามารถดึงข้อมูลร้านค้าได้");
      }

      const fetchedStores: Store[] = json.data ?? [];
      setStores(fetchedStores);

      if (fetchedStores.length === 0) {
        setShowCreateForm(true);
      }
    } catch (error: unknown) {
      console.error("Load stores error:", error);
      const message =
        error instanceof Error ? error.message : "โหลดข้อมูลร้านค้าไม่สำเร็จ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStores();
  }, []);

  const handleCopyLink = (e: MouseEvent, slug?: string) => {
    e.stopPropagation();
    if (!slug) return;

    const fullUrl = `${window.location.origin}/stores/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    toast.success("คัดลอกลิงก์ร้านค้าเรียบร้อยแล้ว");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  async function handleCreateStore(e: FormEvent) {
    e.preventDefault();

    if (!newStoreName.trim()) {
      toast.error("กรุณากรอกชื่อร้านค้า");
      return;
    }

    try {
      setSubmitting(true);
      const finalSlug = newStoreSlug.trim() || generateSlug(newStoreName);

      const payload = {
        name: newStoreName.trim(),
        description: newStoreDesc.trim() || null,
        slug: finalSlug || `store-${Date.now()}`,
        businessType: selectedBusinessType,
        address: newStoreAddress.trim() || null,
        promptpayId: newStorePromptPay.trim() || null,
        bankName: newStoreBankName.trim() || null,
        accountName: newStoreAccountName.trim() || null,
      };

      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "เกิดข้อผิดพลาดในการสร้างร้านค้า");
      }

      toast.success("สร้างร้านค้าสำเร็จ! กำลังเข้าสู่ระบบ...");

      const createdStore = json.data;
      const storeId = createdStore?.id;

      if (storeId) {
        const selectRes = await fetch("/api/stores/select", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId }),
        });
        const selectJson = await selectRes.json();

        if (
          selectRes.ok &&
          selectJson.success &&
          selectJson.data?.redirectUrl
        ) {
          window.location.href = selectJson.data.redirectUrl;
          return;
        }
      }

      const redirectRoutes: Record<string, string> = {
        restaurant: "/restaurant/dashboard",
        cafe: "/cafe/dashboard",
        grocery: "/grocery/dashboard",
      };

      window.location.href =
        redirectRoutes[selectedBusinessType] || "/grocery/dashboard";
    } catch (error: unknown) {
      console.error("Create store error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างร้านค้า";
      toast.error(message);
      setSubmitting(false);
    }
  }

  async function handleSelectStore(storeId: string) {
    try {
      setSelectingId(storeId);
      const res = await fetch("/api/stores/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(`กำลังเข้าสู่ ${json.data.storeName}...`);
        window.location.href = json.data.redirectUrl;
      } else {
        toast.error(json.message || "ไม่สามารถเข้าสู่ร้านค้านี้ได้");
        setSelectingId(null);
      }
    } catch (error: unknown) {
      console.error("Select store error:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setSelectingId(null);
    }
  }

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-300">
        {/* Header Section */}
        <div className="border-b border-border/60 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <StoreIcon className="text-primary h-7 w-7 md:h-8 md:w-8" />{" "}
              เลือกร้านค้าของคุณ
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              จัดการร้านค้า ตั้งค่าการชำระเงิน QR PromptPay
              และเลือกประเภทธุรกิจเพื่อเข้าใช้งาน POS
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={() => void loadStores()}
              disabled={loading}
              className="p-2.5 rounded-2xl border border-border bg-card text-foreground hover:bg-muted transition cursor-pointer flex items-center gap-2 text-xs font-medium"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-primary" : ""}
              />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>
                {showCreateForm ? "ซ่อนฟอร์มสร้างร้าน" : "เปิดร้านค้าใหม่"}
              </span>
              {showCreateForm ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Create Store Form */}
        {showCreateForm && (
          <Card className="rounded-3xl border border-primary/20 bg-card p-6 shadow-md space-y-6 animate-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Plus size={20} className="text-primary" /> เปิดร้านค้าใหม่
              </h2>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1 cursor-pointer"
              >
                <X size={14} /> ล้างข้อมูล
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-6">
              {/* 1. BUSINESS TYPE SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  เลือกประเภทธุรกิจ *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map((typeOption) => {
                    const IconComponent = typeOption.icon;
                    const isSelected = selectedBusinessType === typeOption.id;

                    return (
                      <div
                        key={typeOption.id}
                        onClick={() => setSelectedBusinessType(typeOption.id)}
                        className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                          isSelected
                            ? typeOption.activeCardColor + " shadow-sm"
                            : "bg-background border-border text-muted-foreground hover:border-muted-foreground/50"
                        }`}
                      >
                        <IconComponent size={22} className="mb-3" />
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">
                            {typeOption.label}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {typeOption.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. GENERAL INFO */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  ข้อมูลทั่วไป
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      ชื่อร้านค้า *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ร้านโชวห่วยเจ๊ศรี, คาเฟ่มุมโปรด..."
                      value={newStoreName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <LinkIcon size={12} /> ลิงก์เข้าร้านค้า (Store Slug)
                    </label>
                    <div className="flex items-center rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-within:ring-2 focus-within:ring-primary/25">
                      <span className="text-muted-foreground text-xs mr-1 select-none">
                        /stores/
                      </span>
                      <input
                        type="text"
                        placeholder="store-slug"
                        value={newStoreSlug}
                        onChange={(e) => setNewStoreSlug(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-sm"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    คำอธิบายร้านค้าสั้นๆ
                  </label>
                  <input
                    type="text"
                    placeholder="สโลแกน หรือรายละเอียดสั้นๆ..."
                    value={newStoreDesc}
                    onChange={(e) => setNewStoreDesc(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* 3. LOCATION & ADDRESS */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} className="text-primary" /> ที่อยู่ &
                  โลเคชั่นร้านค้า
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    ที่อยู่ร้านค้า (สำหรับออกใบเสร็จ / แสดงบนสลิป)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น 123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* 4. PAYMENT & PROMPTPAY (FOR DYNAMIC QR CODE) */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <QrCode size={14} className="text-primary" />{" "}
                    ตั้งค่าชำระเงิน (สร้าง Dynamic QR Code สแกนตามยอดจริง)
                  </h3>
                  <span className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-medium">
                    สำคัญสำหรับหน้า POS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CreditCard size={12} /> หมายเลข PromptPay *
                    </label>
                    <input
                      type="text"
                      placeholder="เบอร์โทรศัพท์ หรือ เลขผู้เสียภาษี"
                      value={newStorePromptPay}
                      onChange={(e) => setNewStorePromptPay(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none"
                      disabled={submitting}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      เช่น 0812345678 หรือ 0105551234567
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 size={12} /> ธนาคาร
                    </label>
                    <select
                      value={newStoreBankName}
                      onChange={(e) => setNewStoreBankName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none cursor-pointer"
                      disabled={submitting}
                    >
                      <option value="">-- เลือกธนาคาร --</option>
                      {BANK_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      ชื่อบัญชีธนาคาร
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น บจก. เอสเอ็มอี โพส"
                      value={newStoreAccountName}
                      onChange={(e) => setNewStoreAccountName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/25 focus:outline-none"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 rounded-2xl border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>บันทึกและเปิดใช้งานร้านค้า</span>
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Stores List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">
              ร้านค้าทั้งหมดของคุณ ({stores.length})
            </h2>

            {stores.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="ค้นหาร้านค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/25 focus:outline-none"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground bg-card/50 space-y-3">
              <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium">ยังไม่มีร้านค้าในระบบ</p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition"
              >
                <Plus size={14} /> สร้างร้านแรกของคุณ
              </button>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-3xl text-muted-foreground bg-card/30">
              ไม่พบร้านค้าที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStores.map((store) => {
                const badge = getBusinessTypeBadge(store.businessType);
                const isSelected = selectingId === store.id;

                return (
                  <div
                    key={store.id}
                    onClick={() => handleSelectStore(store.id)}
                    className="group bg-card border border-border rounded-3xl p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>

                        <div className="flex items-center gap-1">
                          {store.slug && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(e, store.slug)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                              title="คัดลอกลิงก์ร้านค้า"
                            >
                              {copiedSlug === store.slug ? (
                                <Check
                                  size={16}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition flex items-center gap-2">
                          {store.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {store.description || "ไม่มีคำอธิบายร้านค้า"}
                        </p>
                      </div>

                      {/* Display Location & PromptPay summary if available */}
                      {(store.address || store.promptpayId) && (
                        <div className="pt-2 text-xs space-y-1 border-t border-border/30 text-muted-foreground">
                          {store.address && (
                            <div className="flex items-start gap-1.5 truncate">
                              <MapPin size={13} className="shrink-0 mt-0.5" />
                              <span className="truncate">{store.address}</span>
                            </div>
                          )}
                          {store.promptpayId && (
                            <div className="flex items-center gap-1.5">
                              <QrCode size={13} className="shrink-0" />
                              <span>PromptPay: {store.promptpayId}</span>
                              {store.bankName && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                  {store.bankName}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <LinkIcon size={12} /> /{store.slug || store.id}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleSelectStore(store.id);
                        }}
                        disabled={isSelected}
                        className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        {isSelected ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>กำลังเข้าสู่ระบบ...</span>
                          </>
                        ) : (
                          <>
                            <span>เข้าสู่ร้านนี้</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE EXPORT (WITH SUSPENSE)
// ==========================================

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <StoresContent />
    </Suspense>
  );
}