/**
 * @fileoverview Barcode Scanner Modal Component - Promptbit POS
 * @module components/BarcodeScannerModal
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, ScanBarcode, Camera, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  lang?: "th" | "en";
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  lang = "th"
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setManualCode("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    toast.success(lang === "th" ? `สแกนบาร์โค้ดสำเร็จ: ${manualCode}` : `Barcode scanned: ${manualCode}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#181B25] border border-blue-100 dark:border-[#2A2E3D] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-[#2A2E3D] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CCE0FF]/60 dark:bg-[#0066FF]/20 text-[#0066FF]">
              <ScanBarcode size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                {lang === "th" ? "สแกนบาร์โค้ดสินค้า" : "Scan Product Barcode"}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {lang === "th" ? "ใช้กล้องหรือพิมพ์รหัสบาร์โค้ด" : "Use camera or enter barcode manually"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-[#252A3A] rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Simulation Viewfinder */}
        <div className="relative w-full h-48 bg-[#F4F7FB] dark:bg-[#12141C] border-2 border-dashed border-[#0066FF]/40 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
          {isScanning ? (
            <div className="flex flex-col items-center gap-3 text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center animate-pulse">
                <Camera size={24} />
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {lang === "th" ? "กำลังเปิดกล้องสแกนบาร์โค้ด..." : "Camera active, scanning..."}
              </p>
              <div className="w-32 h-1 bg-[#0066FF] rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-emerald-500">
              <CheckCircle2 size={32} />
              <span className="text-xs font-bold">สแกนสำเร็จ</span>
            </div>
          )}
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              {lang === "th" ? "หรือพิมพ์รหัสบาร์โค้ดด้วยตนเอง" : "Or enter barcode manually"}
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="เช่น 8850123456789"
              className="w-full bg-[#F4F7FB] dark:bg-[#12141C] border border-blue-100 dark:border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-md shadow-[#0066FF]/20 flex items-center justify-center gap-2"
          >
            <ScanBarcode size={15} />
            <span>{lang === "th" ? "ยืนยันรหัสบาร์โค้ด" : "Confirm Barcode"}</span>
          </button>
        </form>

      </div>
    </div>
  );
}