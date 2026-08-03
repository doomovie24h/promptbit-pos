/**
 * @fileoverview High-Speed Barcode Scanner Modal (UI & Core Integrated)
 * @module components/BarcodeScannerModal
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw, AlertCircle } from "lucide-react";
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
  lang = "th",
}: BarcodeScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divId = "interactive-barcode-scanner-viewport";

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore audio restrictions
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      setIsScanning(false);
      return;
    }

    setScannerError(null);
    let html5QrCode: Html5Qrcode | null = null;
    let hasScanned = false;

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        html5QrCode = new Html5Qrcode(divId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 30,
            qrbox: (w, h) => ({ width: Math.floor(w * 0.8), height: Math.floor(h * 0.35) }),
            aspectRatio: 16/9,
          },
          (decodedText) => {
            if (hasScanned) return;
            hasScanned = true;
            playBeep();
            toast.success(lang === "th" ? `สแกนบาร์โค้ดสำเร็จ: ${decodedText}` : `Scanned: ${decodedText}`);

            try {
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {});
              }
            } catch {
              // ignore
            }

            onScan(decodedText);
            onClose();
          },
          () => {}
        );

        setIsScanning(true);
      } catch (err) {
        console.error("Camera start error:", err);
        setScannerError(
          lang === "th"
            ? "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องใน Browser (แนะนำ Safari/Chrome)"
            : "Unable to access camera. Please check permissions."
        );
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, onScan, onClose, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121622] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {lang === "th" ? "สแกนบาร์โค้ดสินค้า (Auto-Add)" : "Fast Barcode Scanner"}
              </h2>
              <p className="text-[11px] text-zinc-400">
                {lang === "th" ? "วางบาร์โค้ดให้อยู่ในกรอบเพื่อเพิ่มลงตะกร้าทันที" : "Align barcode inside box"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[380px]">
          <div id={divId} className="w-full h-full" />

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[80%] max-w-[320px] h-[130px] border-2 border-dashed border-blue-500/70 rounded-2xl relative overflow-hidden flex items-center bg-blue-500/5">
                <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_15px_#ff0000] animate-bounce" />
              </div>
            </div>
          )}

          {scannerError && (
            <div className="absolute inset-0 bg-[#121622] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <p className="text-xs text-zinc-300 max-w-xs">{scannerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <RefreshCw size={14} />
                <span>{lang === "th" ? "ลองใหม่อีกครั้ง" : "Retry"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0D14] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>{lang === "th" ? "ระบบสแกนความเร็วสูงพิเศษ" : "High-Speed Scanner"}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
          >
            {lang === "th" ? "ปิดหน้าต่าง" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}