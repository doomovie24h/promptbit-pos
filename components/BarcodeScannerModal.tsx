/**
 * @fileoverview Real Camera Barcode Scanner Component - Promptbit POS
 * @module components/BarcodeScannerModal
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ScanBarcode, Camera, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setManualCode("");
      setErrorMessage(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      setErrorMessage(null);
      const constraints = {
        video: { facingMode: { ideal: "environment" } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setErrorMessage(
        lang === "th" 
          ? "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตสิทธิ์การใช้กล้อง หรือใช้การพิมพ์รหัสแทน" 
          : "Camera access denied or unavailable. Please use manual entry."
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    toast.success(lang === "th" ? `สแกนบาร์โค้ดสำเร็จ: ${manualCode}` : `Barcode scanned: ${manualCode}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121622] border border-blue-500/20 dark:border-blue-500/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-[#0066FF] dark:text-blue-400">
              <ScanBarcode size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                {lang === "th" ? "สแกนบาร์โค้ดผ่านกล้อง" : "Camera Barcode Scanner"}
              </h2>
              <p className="text-xs text-zinc-500">
                {lang === "th" ? "วางบาร์โค้ดให้อยู่ในกรอบ หรือพิมพ์รหัส" : "Align barcode in frame or type code"}
              </p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative w-full h-64 bg-zinc-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-zinc-800 shadow-inner">
          {cameraActive && !errorMessage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              {/* Target Scan Box Overlay */}
              <div className="absolute inset-x-12 inset-y-16 border-2 border-dashed border-[#0066FF] rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500/80 animate-pulse absolute" />
              </div>
              <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-zinc-200">
                กำลังสแกนผ่านกล้องมือถือ...
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center p-6 text-zinc-400">
              <AlertCircle size={32} className="text-amber-500" />
              <p className="text-xs">{errorMessage || "กล้องถูกปิดใช้งาน"}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-[#0066FF] text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={14} /> <span>เปิดกล้องใหม่อีกครั้ง</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Fallback */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              {lang === "th" ? "หรือพิมพ์บาร์โค้ด / รหัสสินค้า" : "Or enter barcode manually"}
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="เช่น 8850123456789"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#0066FF] transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{lang === "th" ? "ยืนยันและเพิ่มสินค้า" : "Confirm and Add"}</span>
          </button>
        </form>

      </div>
    </div>
  );
}