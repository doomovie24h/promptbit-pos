/**
 * @fileoverview Enterprise Platform Super Admin Full Control Center (With Store/User Inspectors & Premium Hub)
 * @module app/admin/page
 */

"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Store, 
  Loader2, 
  Search, 
  ShoppingCart, 
  CheckCircle2,
  Server,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  X,
  Trash2, 
  Megaphone, 
  PlusCircle, 
  Shield,
  Crown,
  Filter
} from "lucide-react";
import { 
  getPlatformData, 
  deleteStore, 
  toggleStoreStatus, 
  toggleUserAdminRole, 
  createAnnouncement,
  deleteAnnouncement,
  deleteUser,
  toggleStorePremiumStatus
} from "@/app/actions/admin";
import { toast } from "sonner";

export default function EnterpriseAdminDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "stores" | "users" | "premium" | "announcements" | "logs">("overview");
  
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, cafeStores: 0, groceryStores: 0, totalRevenue: 0, totalOrders: 0, premiumStoresCount: 0 });
  const [currentAdmin, setCurrentAdmin] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [storeCategoryFilter, setStoreCategoryFilter] = useState<string>("all");
  const [annTitle, setAnnTitle] = useState<string>("");
  const [annContent, setAnnContent] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modals
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await getPlatformData();
    if (res.success && res.stats) {
      setStats(res.stats);
      setCurrentAdmin(res.currentAdmin || "Admin");
      setUsers(res.users || []);
      setStores(res.stores || []);
      setOrders(res.orders || []);
      setAnnouncements(res.announcements || []);
      setAuditLogs(res.auditLogs || []);
      setSystemHealth(res.systemHealth || {});
    } else {
      toast.error(res.error ?? "โหลดข้อมูลระบบไม่สำเร็จ");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const handleToggleStoreStatus = async (storeId: string) => {
    setActionLoading(true);
    const res = await toggleStoreStatus(storeId);
    if (res.success) {
      toast.success(res.message);
      void loadData();
      if (selectedStore && selectedStore.id === storeId) {
        const updated = stores.find(s => s.id === storeId);
        if (updated) setSelectedStore({ ...updated, status: updated.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" });
      }
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handleTogglePremium = async (storeId: string) => {
    setActionLoading(true);
    const res = await toggleStorePremiumStatus(storeId);
    if (res.success) {
      toast.success(res.message);
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (!confirm(`คำเตือน: คุณต้องการลบร้าน "${storeName}" ถาวรใช่หรือไม่ ข้อมูลทั้งหมดจะหายไป`)) return;

    setActionLoading(true);
    const res = await deleteStore(storeId);
    if (res.success) {
      toast.success(res.message);
      setSelectedStore(null);
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handleToggleUserRole = async (userId: string) => {
    setActionLoading(true);
    const res = await toggleUserAdminRole(userId);
    if (res.success) {
      toast.success(res.message);
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`คำเตือน: คุณต้องการลบผู้ใช้ "${username}" ถาวรใช่หรือไม่ ข้อมูลทั้งหมดจะหายไป`)) return;

    setActionLoading(true);
    const res = await deleteUser(userId);
    if (res.success) {
      toast.success(res.message);
      setSelectedUser(null);
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหาประกาศ");
      return;
    }

    setActionLoading(true);
    const res = await createAnnouncement(annTitle, annContent);
    if (res.success) {
      toast.success(res.message);
      setAnnTitle("");
      setAnnContent("");
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("คุณต้องการลบประกาศนี้ใช่หรือไม่?")) return;
    setActionLoading(true);
    const res = await deleteAnnouncement(id);
    if (res.success) {
      toast.success(res.message);
      void loadData();
    } else {
      toast.error(res.error);
    }
    setActionLoading(false);
  };

  const filteredStores = stores.filter(s => {
    const matchesSearch = (s.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.slug ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    if (storeCategoryFilter === "all") return matchesSearch;
    return matchesSearch && s.businessType === storeCategoryFilter;
  });

  const premiumStores = stores.filter(s => s.isPremium || s.subscriptionStatus === "ACTIVE");

  const filteredUsers = users.filter(u => 
    (u.username ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 relative">
      
      {/* Header & Enterprise Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Shield size={14} />
            <span>Enterprise Super Admin Hub (Logged in as: {currentAdmin})</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Promptbit Command Center</h1>
          <p className="text-xs text-muted-foreground mt-1">
            ควบคุมระบบ ตรวจสอบร้านค้าพรีเมียม ข้อมูลผู้ใช้เชิงลึก และระบบบันทึก Audit Logs แบบเรียลไทม์
          </p>
        </div>

        {/* Navigation Tabs (ลบแท็บ ธุรกรรม ออกแล้ว) */}
        <div className="flex flex-wrap items-center gap-1 bg-muted p-1 rounded-2xl text-xs font-bold shadow-inner">
          <button onClick={() => setActiveTab("overview")} className={`px-3 py-2 rounded-xl transition ${activeTab === "overview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>ภาพรวม</button>
          <button onClick={() => setActiveTab("stores")} className={`px-3 py-2 rounded-xl transition ${activeTab === "stores" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>ร้านค้า ({stores.length})</button>
          <button onClick={() => setActiveTab("users")} className={`px-3 py-2 rounded-xl transition ${activeTab === "users" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>ผู้ใช้ ({users.length})</button>
          <button onClick={() => setActiveTab("premium")} className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "premium" ? "bg-amber-500 text-white shadow-sm" : "text-amber-500 hover:bg-amber-500/10"}`}><Crown size={14} /> พรีเมียม ({premiumStores.length})</button>
          <button onClick={() => setActiveTab("announcements")} className={`px-3 py-2 rounded-xl transition ${activeTab === "announcements" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>ประกาศ</button>
          <button onClick={() => setActiveTab("logs")} className={`px-3 py-2 rounded-xl transition ${activeTab === "logs" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Audit Logs</button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW (ปรับเปลี่ยนจากการ์ดยอดขายรวม เป็นคำสั่งซื้อรวมทั่วระบบ) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs font-bold uppercase">ผู้ใช้งานทั้งหมด</span><Users size={20} className="text-primary" /></div>
              <div className="text-4xl font-black">{stats.totalUsers}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs font-bold uppercase">ร้านค้าทั้งหมด</span><Store size={20} className="text-indigo-500" /></div>
              <div className="text-4xl font-black">{stats.totalStores}</div>
              <p className="text-xs text-muted-foreground">คาเฟ่ {stats.cafeStores} | ค้าปลีก {stats.groceryStores}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs font-bold uppercase">ร้านค้าพรีเมียม</span><Crown size={20} className="text-amber-500" /></div>
              <div className="text-4xl font-black text-amber-500">{stats.premiumStoresCount}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs font-bold uppercase">คำสั่งซื้อรวมทั่วระบบ</span><ShoppingCart size={20} className="text-emerald-500" /></div>
              <div className="text-4xl font-black">{(stats.totalOrders ?? orders.length).toLocaleString()} รายการ</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORES MANAGEMENT WITH CATEGORIES */}
      {activeTab === "stores" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="ค้นหาชื่อร้านค้า หรือ Slug..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-muted-foreground" />
              <select 
                value={storeCategoryFilter} 
                onChange={(e) => setStoreCategoryFilter(e.target.value)}
                className="bg-background border border-border rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">ทุกหมวดหมู่ร้านค้า</option>
                <option value="cafe">คาเฟ่ (Cafe)</option>
                <option value="grocery">ค้าปลีก / โชห่วย (Grocery)</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase">
                    <th className="py-4 px-6">ชื่อร้านค้า</th>
                    <th className="py-4 px-6">หมวดหมู่</th>
                    <th className="py-4 px-6">วันเวลาที่สร้าง (ละเอียด)</th>
                    <th className="py-4 px-6">สถานะพรีเมียม</th>
                    <th className="py-4 px-6 text-right">เครื่องมือ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStores.map((store) => {
                    const isPrem = store.isPremium || store.subscriptionStatus === "ACTIVE";
                    return (
                      <tr key={store.id} className="hover:bg-muted/20 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-sm text-foreground">{store.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">Slug: {store.slug}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${store.businessType === "cafe" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                            {store.businessType === "cafe" ? "คาเฟ่" : "ค้าปลีก"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-muted-foreground">
                          {new Date(store.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${isPrem ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                            <Crown size={12} /> {isPrem ? "พรีเมียม" : "ทั่วไป"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button onClick={() => setSelectedStore(store)} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold inline-flex items-center gap-1 transition">
                            <Eye size={14} /> ดูข้างใน
                          </button>
                          <button disabled={actionLoading} onClick={() => handleTogglePremium(store.id)} className={`px-3 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1 ${isPrem ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                            <Crown size={14} /> {isPrem ? "ถอดพรีเมียม" : "ให้พรีเมียม"}
                          </button>
                          <button disabled={actionLoading} onClick={() => handleDeleteStore(store.id, store.name)} className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold inline-flex items-center gap-1">
                            <Trash2 size={14} /> ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS WITH DETAILED INFO & EYE ICON INSPECTOR */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="ค้นหา Username หรือ Email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-background border border-border rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground">แสดงผลผู้ใช้งานทั้งหมด {filteredUsers.length} รายการ</div>
          </div>

          <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase">
                  <th className="py-4 px-6">ยูสเซอร์เนม (Username)</th>
                  <th className="py-4 px-6">อีเมล (Email)</th>
                  <th className="py-4 px-6">วันเวลาที่สร้าง (ละเอียด)</th>
                  <th className="py-4 px-6">สิทธิ์ระบบ</th>
                  <th className="py-4 px-6 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition">
                    <td className="py-4 px-6 font-bold text-sm text-foreground">{u.username}</td>
                    <td className="py-4 px-6 text-muted-foreground">{u.email || "ไม่มีอีเมล"}</td>
                    <td className="py-4 px-6 font-mono text-muted-foreground">
                      {new Date(u.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.isSuperAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {u.isSuperAdmin ? "Super Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => setSelectedUser(u)} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold inline-flex items-center gap-1 transition">
                        <Eye size={14} /> ตรวจสอบ
                      </button>
                      <button disabled={actionLoading} onClick={() => handleToggleUserRole(u.id)} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 inline-flex items-center gap-1">
                        <ShieldCheck size={14} /> {u.isSuperAdmin ? "ถอดสิทธิ์" : "ตั้ง Admin"}
                      </button>
                      <button disabled={actionLoading} onClick={() => handleDeleteUser(u.id, u.username)} className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold inline-flex items-center gap-1">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PREMIUM STORES HUB */}
      {activeTab === "premium" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/20 p-6 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs"><Crown size={14} /> ศูนย์รวมร้านค้าระดับพรีเมียม</div>
              <h2 className="text-xl font-extrabold pt-1">ร้านค้าทั้งหมดที่สมัครสมาชิกพรีเมียมจะแสดงที่นี่โดยอัตโนมัติ</h2>
            </div>
            <div className="text-3xl font-black text-amber-500">{premiumStores.length} ร้าน</div>
          </div>

          <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase">
                  <th className="py-4 px-6">ชื่อร้านพรีเมียม</th>
                  <th className="py-4 px-6">หมวดหมู่</th>
                  <th className="py-4 px-6">วันเวลาสมัคร/สร้าง</th>
                  <th className="py-4 px-6 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {premiumStores.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">ยังไม่มีร้านค้าใดสมัครสมาชิกพรีเมียมในขณะนี้</td></tr>
                ) : (
                  premiumStores.map((store) => (
                    <tr key={store.id} className="hover:bg-muted/20 transition">
                      <td className="py-4 px-6 font-bold text-sm">{store.name}</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">{store.businessType}</span></td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">
                        {new Date(store.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => setSelectedStore(store)} className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary font-bold inline-flex items-center gap-1"><Eye size={14} /> ดูข้างใน</button>
                        <button onClick={() => handleTogglePremium(store.id)} className="px-3.5 py-1.5 rounded-xl bg-destructive/10 text-destructive font-bold inline-flex items-center gap-1">ถอดพรีเมียม</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 h-fit">
            <div className="flex items-center gap-2 font-bold text-sm"><Megaphone size={18} className="text-primary" /><span>สร้างประกาศระบบ</span></div>
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <input type="text" placeholder="หัวข้อประกาศ" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary" />
              <textarea rows={4} placeholder="เนื้อหาประกาศ..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} className="w-full bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 focus:ring-primary resize-none" />
              <button type="submit" disabled={actionLoading} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2">
                <PlusCircle size={16} /> เผยแพร่ประกาศ
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold">ประวัติประกาศทั้งหมด</h2>
            {announcements.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border bg-card p-6 shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                  <span className="text-[10px] text-muted-foreground block pt-2">
                    {new Date(item.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <button disabled={actionLoading} onClick={() => handleDeleteAnnouncement(item.id)} className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive font-bold text-xs inline-flex items-center gap-1 shrink-0">
                  <Trash2 size={14} /> ลบ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">System Audit Logs</h2>
              <p className="text-xs text-muted-foreground">บันทึกทุกความเคลื่อนไหวของแอดมิน</p>
            </div>
            <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Secure Audit Trail</div>
          </div>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase">
                  <th className="py-3 px-4">ผู้ดูแลระบบ</th>
                  <th className="py-3 px-4">ประเภทกิจกรรม</th>
                  <th className="py-3 px-4">รายละเอียด</th>
                  <th className="py-3 px-4 text-right">เวลาทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-primary">{log.adminName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-500">{log.action}</td>
                    <td className="py-3 px-4 text-foreground">{log.details}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STORE INSPECTOR MODAL (อัปเดตให้แสดง เจ้าของร้าน และ ยอดขายของร้าน) */}
      {selectedStore && (() => {
        // คำนวณยอดขายและออเดอร์ของร้านนี้จาก state orders
        const storeOrders = orders.filter(o => o.storeId === selectedStore.id || o.store?.id === selectedStore.id);
        const storeRevenue = storeOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
        
        // ค้นหาข้อมูลเจ้าของร้าน (รองรับฟิลด์ members หรือ user)
        const ownerName = selectedStore.members?.[0]?.user?.username || selectedStore.user?.username || selectedStore.ownerName || "ไม่ระบุเจ้าของ";
        const ownerEmail = selectedStore.members?.[0]?.user?.email || selectedStore.user?.email || selectedStore.ownerEmail || "-";

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Store Inspector</span>
                  <h2 className="text-xl font-extrabold mt-1">{selectedStore.name}</h2>
                  <p className="text-xs font-mono text-muted-foreground">Slug: {selectedStore.slug}</p>
                </div>
                <button onClick={() => setSelectedStore(null)} className="p-2 rounded-full hover:bg-muted transition text-muted-foreground"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <div className="text-xs text-muted-foreground">เจ้าของร้าน / ผู้ดูแล</div>
                  <div className="text-sm font-bold text-foreground">{ownerName}</div>
                  <div className="text-[11px] text-muted-foreground">Email: {ownerEmail}</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <div className="text-xs text-muted-foreground">ยอดขายรวมของร้านนี้</div>
                  <div className="text-lg font-black text-emerald-600">฿{storeRevenue.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">จากทั้งหมด {storeOrders.length} คำสั่งซื้อ</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <div className="text-xs text-muted-foreground">ประเภทธุรกิจ</div>
                  <div className="text-sm font-bold">{selectedStore.businessType}</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <div className="text-xs text-muted-foreground">วันเวลาสร้างร้าน</div>
                  <div className="text-xs font-mono font-bold">{new Date(selectedStore.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button onClick={() => setSelectedStore(null)} className="px-4 py-2 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 transition">ปิดหน้าต่าง</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* USER INSPECTOR MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">User Inspector Hub</span>
                <h2 className="text-xl font-extrabold mt-1">{selectedUser.username}</h2>
                <p className="text-xs font-mono text-muted-foreground">Email: {selectedUser.email || "ไม่มีอีเมล"}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-muted transition text-muted-foreground"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <div className="text-xs text-muted-foreground">สิทธิ์ผู้ใช้งาน</div>
                <div className="text-sm font-bold">{selectedUser.isSuperAdmin ? "Super Admin" : "User ทั่วไป"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <div className="text-xs text-muted-foreground">วันเวลาที่สร้างบัญชี</div>
                <div className="text-xs font-mono font-bold">{new Date(selectedUser.createdAt).toLocaleString("th-TH", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 transition">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}