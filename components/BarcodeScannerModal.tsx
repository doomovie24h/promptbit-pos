/**
 * @fileoverview Barcode Scanner Modal - Production Core Logic
 * @module components/BarcodeScannerModal
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divId = "barcode-scanner-viewport-core";

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore audio context restrictions
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
      return;
    }

    setErrorMessage(null);
    let html5QrCode: Html5Qrcode | null = null;
    let hasScanned = false;

    const initScanner = async () => {
      try {
        await new Promise((r) => setTimeout(r, 200));
        html5QrCode = new Html5Qrcode(divId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 30,
            qrbox: { width: 300, height: 150 },
            aspectRatio: 16/9,
          },
          (decodedText) => {
            if (hasScanned) return;
            hasScanned = true;
            playBeep();

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
      } catch (err) {
        console.error("Scanner init error:", err);
        setErrorMessage("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้อง");
      }
    };

    initScanner();

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
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "#222", borderRadius: "8px", overflow: "hidden", padding: "16px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <strong>สแกนบาร์โค้ดสินค้า</strong>
          <button onClick={onClose} style={{ background: "red", color: "#fff", border: "none", padding: "4px 8px", cursor: "pointer" }}>ปิด</button>
        </div>
        
        <div id={divId} style={{ width: "100%", minHeight: "300px", background: "#000" }} />

        {errorMessage && (
          <div style={{ color: "orange", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}