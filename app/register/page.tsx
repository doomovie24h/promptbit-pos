/**
 * @fileoverview Register Page - Promptbit POS
 * @module app/register/page
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLengthValid = password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถสมัครสมาชิกได้");
      }

      // บันทึก Token ลงใน localStorage ทันที เพื่อให้ระบบจดจำสถานะการเข้าสู่ระบบ
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      router.push("/setup-business");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
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
          <span className="text-xs text-zinc-500 dark:text-zinc-400">ขั้นตอนที่ 1 จาก 2</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">สร้างบัญชีผู้ดูแล</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">เริ่มต้นใช้งานระบบบริหารจัดการร้านค้า</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
            </label>
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
            
            {password.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <CheckCircle2 size={13} className={isLengthValid ? "text-emerald-600 dark:text-[#21F1A8]" : "text-zinc-400"} />
                <span className={isLengthValid ? "text-emerald-700 dark:text-[#21F1A8]" : "text-zinc-500"}>
                  ความยาวรหัสผ่านผ่านเกณฑ์แล้ว
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004741] hover:bg-[#003833] dark:bg-[#21F1A8] dark:hover:bg-[#1bd495] text-white dark:text-black font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md mt-3"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังสร้างบัญชี...</span>
              </>
            ) : (
              <span>ดำเนินการต่อ</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200 dark:border-[#2f2f2f] leading-relaxed">
          มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
          <Link href="/login" className="text-zinc-900 dark:text-white hover:underline font-semibold">
            เข้าสู่ระบบ
          </Link>
        </div>

      </div>
    </div>
  );
}