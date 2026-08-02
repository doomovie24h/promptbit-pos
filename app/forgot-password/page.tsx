/**
 * @fileoverview Enterprise Forgot Password Page - Promptbit POS Platform
 * @module app/forgot-password/page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ตัวอย่างการเรียกใช้งาน API สำหรับรีเซ็ตรหัสผ่าน (ปรับเปลี่ยน path ตาม backend ของคุณ)
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* ฝั่งซ้าย: Branding & Enterprise Highlights (แสดงผลเฉพาะจอใหญ่) */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-muted/30 border-r border-border p-12 flex-col justify-between overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
            P
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-lg block">Promptbit POS</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Enterprise Infrastructure</span>
          </div>
        </div>

        {/* Middle Value Prop */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles size={14} />
            <span>ความปลอดภัยระดับสูงสุด</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            กู้คืนบัญชีและจัดการรหัสผ่านของคุณอย่างปลอดภัย
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ระบบตรวจสอบตัวตนแบบเข้ารหัส เพื่อป้องกันการเข้าถึงข้อมูลร้านค้าและยอดขายของคุณโดยไม่ได้รับอนุญาต
          </p>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-muted-foreground border-t border-border/50 pt-6">
          <ShieldCheck size={18} className="text-emerald-500" />
          <span>Automated recovery link generation with strict token expiration policies.</span>
        </div>
      </div>

      {/* ฝั่งขวา: Forgot Password Form */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-base">
              P
            </div>
            <span className="font-extrabold tracking-tight text-base">Promptbit POS</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">ลืมรหัสผ่าน?</h1>
            <p className="text-xs text-muted-foreground">
              ไม่ต้องกังวล! กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านใหม่ให้คุณ
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5 animate-in fade-in-50">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  อีเมลที่ลงทะเบียน
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary transition shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>กำลังส่งลิงก์รีเซ็ต...</span>
                  </>
                ) : (
                  <>
                    <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 p-6 rounded-2xl bg-card border border-border text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm">ส่งคำขอสำเร็จแล้ว</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่ <span className="font-bold text-foreground">{email}</span> เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความหรืออีเมลขยะ (Spam)
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-primary hover:underline"
              >
                ส่งอีเมลใหม่อีกครั้ง
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={14} />
              <span>กลับสู่หน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}