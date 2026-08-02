/**
 * @fileoverview Setup Business Page with Map Pinning - Promptbit POS
 * @module app/setup-business/page
 */

"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import {
  ShoppingCart,
  Coffee,
  ChefHat,
  Loader2,
  Store as StoreIcon,
  MapPin,
  QrCode,
  CreditCard,
  Building2,
  Link as LinkIcon,
  Navigation,
  Map,
} from "lucide-react";
import { toast } from "sonner";

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

export default function SetupBusinessPage() {
  const [businessType, setBusinessType] = useState<string>("grocery");
  const [storeName, setStoreName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  // ข้อมูลที่อยู่ และ พิกัดปักหมุด (Map Pinning)
  const [address, setAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(13.7563); // กรุงเทพฯ เป็น Default
  const [longitude, setLongitude] = useState<number>(100.5018);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // ตั้งค่า PromptPay / ธนาคารสำหรับ Dynamic QR Code
  const [promptpayId, setPromptpayId] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  // Reference สำหรับแผนที่ Leaflet / OpenStreetMap
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // โหลด Script และตั้งค่า Map
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. โหลด Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. โหลด Leaflet JS
    const initMap = () => {
      if (!(window as any).L || !mapContainerRef.current) return;
      const L = (window as any).L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // สร้าง Custom Icon หรือใช้ Default Marker
      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current = marker;

      // Event คลิกที่แผนที่เพื่อปักหมุดใหม่
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        updatePosition(lat, lng);
      });

      // Event ลากหมุด (Drag Marker)
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updatePosition(pos.lat, pos.lng);
      });
    };

    if (!(window as any).L) {
      let script = document.getElementById("leaflet-js") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", initMap);
      }
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ฟังก์ชันอัปเดตตำแหน่ง + แปลงพิกัดเป็นที่อยู่อัตโนมัติ (Reverse Geocoding)
  const updatePosition = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
    }
  };

  // ฟังก์ชันดึงตำแหน่ง GPS ปัจจุบันของผู้ใช้
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง GPS");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        updatePosition(lat, lng);
        setIsLocating(false);
        toast.success("ดึงตำแหน่ง GPS ปัจจุบันสำเร็จ!");
      },
      (error) => {
        console.error("GPS Error:", error);
        toast.error("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตสิทธิ์เข้าถึงตำแหน่ง (Location Access)");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("กรุณากรอกชื่อร้านค้า");
      return;
    }

    try {
      setLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ||
            localStorage.getItem("auth_token") ||
            localStorage.getItem("access_token")
          : null;

      const res = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          name: storeName.trim(),
          slug: slug.trim() || `store-${Date.now()}`,
          businessType: businessType,
          description: description.trim() || null,
          address: address.trim() || null,
          latitude: latitude,
          longitude: longitude,
          promptpayId: promptpayId.trim() || null,
          bankName: bankName.trim() || null,
          accountName: accountName.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || (!json.success && !json.data)) {
        throw new Error(
          json.error || json.message || "ไม่สามารถสร้างร้านค้าได้"
        );
      }

      toast.success("สร้างร้านค้าสำเร็จ!");

      const targetUrl =
        businessType === "restaurant"
          ? "/restaurant/dashboard"
          : businessType === "cafe"
          ? "/cafe/dashboard"
          : "/grocery/dashboard";

      window.location.href = targetUrl;
    } catch (error: unknown) {
      console.error("Setup store error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการตั้งค่าระบบ";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-zinc-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-[#212121] border border-[#2f2f2f] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#2f2f2f] pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
            <StoreIcon size={18} /> เปิดร้านค้าใหม่
          </div>
          <span className="text-xs text-zinc-400 bg-[#2b2b2b] px-3 py-1 rounded-full border border-[#383838]">
            ระบบ POS
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">
            ข้อมูลร้านค้าของคุณ
          </h1>
          <p className="text-sm text-zinc-400">
            เลือกประเภทธุรกิจ ปักหมุดแผนที่ร้านค้า และตั้งค่าระบบชำระเงิน Dynamic QR
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. เลือกประเภทธุรกิจ */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300">
              เลือกประเภทธุรกิจ *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setBusinessType("grocery")}
                className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  businessType === "grocery"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md"
                    : "bg-[#1a1a1a] border-[#333333] text-zinc-400 hover:border-zinc-500"
                }`}
              >
                <ShoppingCart size={22} className="mb-3" />
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">
                    โชวห่วย / ค้าปลีก
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    เน้นระบบสแกนบาร์โค้ด & สต็อก
                  </p>
                </div>
              </div>

              <div
                onClick={() => setBusinessType("cafe")}
                className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  businessType === "cafe"
                    ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md"
                    : "bg-[#1a1a1a] border-[#333333] text-zinc-400 hover:border-zinc-500"
                }`}
              >
                <Coffee size={22} className="mb-3" />
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">คาเฟ่</h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    เน้นระบบจัดการเครื่องดื่ม & คิว
                  </p>
                </div>
              </div>

              <div
                onClick={() => setBusinessType("restaurant")}
                className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  businessType === "restaurant"
                    ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-md"
                    : "bg-[#1a1a1a] border-[#333333] text-zinc-400 hover:border-zinc-500"
                }`}
              >
                <ChefHat size={22} className="mb-3" />
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">
                    ร้านอาหาร
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    เน้นระบบจัดการโต๊ะ & ออเดอร์
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ข้อมูลทั่วไป */}
          <div className="space-y-4 pt-2 border-t border-[#2f2f2f]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              ข้อมูลทั่วไป
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  ชื่อร้านค้า *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={handleNameChange}
                  placeholder="เช่น ร้านโชวห่วยเจ๊ศรี, คาเฟ่มุมโปรด..."
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1">
                  <LinkIcon size={12} /> URL ร้านค้า (Slug)
                </label>
                <div className="flex items-center bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm focus-within:border-emerald-500 transition-all">
                  <span className="text-zinc-500 text-xs mr-1 select-none">
                    /stores/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="store-slug"
                    className="w-full bg-transparent text-zinc-100 focus:outline-none text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                คำอธิบายร้านค้าสั้นๆ (ถ้ามี)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดสั้นๆ หรือสโลแกนร้าน..."
                className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* 3. ปักหมุดแผนที่ร้านค้า (Google Maps / OpenStreetMap Style) */}
          <div className="space-y-3 pt-2 border-t border-[#2f2f2f]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Map size={14} className="text-emerald-400" /> ปักหมุดตำแหน่งร้านค้าบนแผนที่
              </h2>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating || loading}
                className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isLocating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Navigation size={12} />
                )}
                <span>ดึงตำแหน่ง GPS ปัจจุบัน</span>
              </button>
            </div>

            {/* Container แผนที่สำหรับคลิกปักหมุด */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[#333333] shadow-inner bg-[#1a1a1a]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-3 left-3 z-10 bg-[#212121]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#383838] text-[11px] text-zinc-300 flex items-center gap-1.5 shadow">
                <MapPin size={13} className="text-emerald-400" />
                <span>คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่งร้าน</span>
              </div>
            </div>

            {/* แสดงค่า Lat / Lng */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1a1a1a] border border-[#333333] px-3 py-2 rounded-xl text-zinc-400 flex items-center justify-between">
                <span>Latitude (ละติจูด):</span>
                <span className="text-zinc-100 font-mono font-medium">{latitude.toFixed(6)}</span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] px-3 py-2 rounded-xl text-zinc-400 flex items-center justify-between">
                <span>Longitude (ลองจิจูด):</span>
                <span className="text-zinc-100 font-mono font-medium">{longitude.toFixed(6)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                ที่อยู่ร้านค้า (ระบบจะกรอกอัตโนมัติเมื่อปักหมุด หรือสามารถแก้ไขเพิ่มเติมได้)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="เช่น 123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* 4. ตั้งค่าชำระเงิน Dynamic QR Code */}
          <div className="space-y-4 pt-2 border-t border-[#2f2f2f]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <QrCode size={14} className="text-emerald-400" /> ตั้งค่าชำระเงิน (Dynamic QR Code)
              </h2>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                สร้าง QR สแกนตามยอดจริง
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1">
                  <CreditCard size={12} /> หมายเลข PromptPay
                </label>
                <input
                  type="text"
                  value={promptpayId}
                  onChange={(e) => setPromptpayId(e.target.value)}
                  placeholder="เบอร์โทร / เลขผู้เสียภาษี"
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1">
                  <Building2 size={12} /> ธนาคาร
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  disabled={loading}
                >
                  <option value="" className="bg-[#212121] text-zinc-400">
                    -- เลือกธนาคาร --
                  </option>
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-[#212121] text-zinc-100">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  ชื่อบัญชีธนาคาร
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="เช่น บจก. พรอมต์บิต POS"
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#21F1A8] hover:bg-[#1bd495] text-black font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-4"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังสร้างร้านค้า...</span>
              </>
            ) : (
              <span>สร้างร้านค้าใหม่ ➜</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}