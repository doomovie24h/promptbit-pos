/**
 * @fileoverview Barcode Scanner Modal - Optimized for Distance & Auto-Focus
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

  // ฟังก์ชันเล่นเสียงปี๊บเมื่อสแกนสำเร็จ
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
      setIsScanning(false);
      return;
    }

    setScannerError(null);
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        html5QrCode = new Html5Qrcode(divId);
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText: string) => {
          playBeep();
          toast.success(lang === "th" ? `สแกนสำเร็จ: ${decodedText}` : `Scanned: ${decodedText}`);
          
          if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              onScan(decodedText);
              onClose();
            }).catch(() => {
              onScan(decodedText);
              onClose();
            });
          } else {
            onScan(decodedText);
            onClose();
          }
        };

        const config = {
          fps: 25,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.floor(viewfinderWidth * 0.8);
            const height = Math.floor(viewfinderHeight * 0.35);
            return { width, height };
          },
          aspectRatio: 16/9,
        };

        const constraints: MediaTrackConstraints = {
          facingMode: "environment",
          width: { min: 1280, ideal: 1920, max: 2560 },
          height: { min: 720, ideal: 1080, max: 1440 },
          // @ts-expect-error - advanced focusMode is supported by modern mobile browsers
          advanced: [{ focusMode: "continuous" }]
        };

        await html5QrCode.start(
          constraints,
          config,
          qrCodeSuccessCallback,
          () => {}
        );

        setIsScanning(true);
      } catch (err: unknown) {
        console.error("Camera start error with advanced constraints, falling back...", err);
        
        try {
          if (html5QrCode) {
            await html5QrCode.start(
              { facingMode: "environment" },
              { fps: 20, qrbox: { width: 300, height: 150 } },
              (decodedText) => {
                playBeep();
                toast.success(`สแกนสำเร็จ: ${decodedText}`);
                html5QrCode?.stop().then(() => {
                  onScan(decodedText);
                  onClose();
                });
              },
              () => {}
            );
            setIsScanning(true);
            return;
          }
        } catch (fallbackErr) {
          console.error("Fallback camera error:", fallbackErr);
        }

        setScannerError(
          lang === "th"
            ? "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องใน Browser"
            : "Unable to access camera. Please check permissions."
        );
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.error("Cleanup stop error:", err));
      }
    };
  }, [isOpen, onScan, onClose, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121622] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[#0066FF]">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {lang === "th" ? "สแกนบาร์โค้ดชำระเงิน" : "Fast Barcode Scanner"}
              </h2>
              <p className="text-[11px] text-zinc-400">
                {lang === "th" ? "วางบาร์โค้ดให้อยู่ในกรอบ (ไม่ต้องจ่อใกล้เกินไป)" : "Align barcode inside the box"}
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

        {/* Camera Viewport Area */}
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[400px]">
          <div id={divId} className="w-full h-full" />

          {/* Laser Scanning Line Animation */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[80%] max-w-[340px] h-[140px] border-2 border-dashed border-blue-500/70 rounded-2xl relative overflow-hidden flex items-center bg-blue-500/5">
                <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_15px_#ff0000] animate-bounce" />
              </div>
            </div>
          )}

          {/* Error State */}
          {scannerError && (
            <div className="absolute inset-0 bg-[#121622] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <p className="text-xs text-zinc-300 max-w-xs">{scannerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#0066FF] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw size={14} />
                <span>{lang === "th" ? "ลองใหม่อีกครั้ง" : "Retry"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#0A0D14] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>{lang === "th" ? "ระบบโฟกัสอัตโนมัติความคมชัดสูง" : "High-Resolution Auto-Focus"}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
          >
            {lang === "th" ? "ปิดหน้าต่าง" : "Cancel"}
          </button>
        </div>

      </div>
    </div>
  );
}