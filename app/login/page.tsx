/**
 * @fileoverview Modern Login Page with Social Auth & Light/Dark Theme - Promptbit POS
 * @module app/login/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const SocialButton = ({ icon: Icon, label, provider }: { icon: any, label: string, provider: string }) => (
  <button
    type="button"
    onClick={() => { /* Handle Social Auth */ }}
    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a1a1a] border border-zinc-300 dark:border-[#333333] hover:bg-zinc-50 dark:hover:bg-[#2b2b2b] text-zinc-800 dark:text-zinc-200 font-medium py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("1. เริ่มต้นกดปุ่มเข้าสู่ระบบ ส่งข้อมูลไปที่ /api/auth/login...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("2. ได้รับการตอบกลับจาก API, Status:", res.status);
      const data = await res.json();
      console.log("3. ข้อมูลที่ได้จาก API JSON:", data);

      if (!res.ok) {
        throw new Error(data.message || data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }

      // บังคับเปลี่ยนหน้าไปที่ /stores เสมอ เพื่อให้ผู้ใช้เลือกร้านค้าได้อย่างถูกต้อง
      const targetUrl = "/stores";
      console.log("4. กำลังบังคับเปลี่ยนหน้าไปที่:", targetUrl);

      // ใช้ Hard Redirect เพื่อบังคับย้ายหน้าทันที
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error("❌ เกิดข้อผิดพลาดในบล็อก Catch:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4] dark:bg-[#171717] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-[380px] space-y-6 bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2f2f2f] p-8 rounded-2xl shadow-xl">
        
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-[#004741] dark:bg-[#21F1A8] text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
            P
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#2b2b2b] border border-zinc-200 dark:border-[#383838] text-xs text-zinc-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004741] dark:bg-[#21F1A8] animate-pulse" />
            เซสชันปลอดภัย
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">เข้าสู่ระบบ Promptbit</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            เลือกวิธีเข้าถึงพื้นที่ทำงานร้านค้าของคุณ
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <SocialButton icon={FcGoogle} label="Continue with Google" provider="google" />
          <SocialButton icon={FaGithub} label="Continue with GitHub" provider="github" />
        </div>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-zinc-200 dark:border-[#333333]"></div>
          <span className="flex-shrink mx-4 text-xs text-zinc-400 dark:text-zinc-500 font-medium">หรือใช้รหัสผ่าน</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-[#333333]"></div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              อีเมลผู้ใช้งาน
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-300 dark:border-[#333333] rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#004741] dark:focus:border-[#21F1A8] text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                รหัสผ่าน
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#004741] dark:text-[#21F1A8] hover:underline font-medium"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-300 dark:border-[#333333] rounded-xl pl-4 pr-11 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#004741] dark:focus:border-[#21F1A8] text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-50 dark:bg-[#1a1a1a] border-zinc-300 dark:border-[#333333] text-[#004741] dark:text-[#21F1A8] focus:ring-0 accent-[#004741] dark:accent-[#21F1A8]"
              />
              <span>จดจำการเข้าสู่ระบบในเครื่องนี้</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-3"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ POS</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200 dark:border-[#2f2f2f] leading-relaxed">
          ยังไม่มีบัญชีร้านค้า?{" "}
          <Link href="/register" className="text-zinc-900 dark:text-white hover:underline font-semibold">
            สมัครสมาชิกใหม่
          </Link>
        </div>

      </div>
    </div>
  );
}