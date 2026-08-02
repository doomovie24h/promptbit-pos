/**
 * @fileoverview Upgraded Receipt Modal Component for Promptbit POS with Mobile Image Save & Bluetooth Print
 * @module components/pos/ReceiptModal
 */

"use client";

import React from "react";
import { X, Printer, FileText, Check, Store, Download } from "lucide-react";
import { toPng } from "html-to-image";

export interface ReceiptItem {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unitName: string;
  total: number;
}

export interface ReceiptTransaction {
  id: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: "CASH" | "PROMPTPAY" | "CREDIT";
  receivedAmount: number;
  changeAmount: number;
  customerName?: string;
  cashierName?: string;
  tableNumber?: string;   
  orderType?: string;     
}

export interface StoreInfo {
  name: string;
  address?: string;
  phone?: string;
  taxId?: string;
  branch?: string;
  website?: string;
  logoUrl?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSale: () => void;
  transaction: ReceiptTransaction | null;
  storeInfo: StoreInfo;
  isDarkMode?: boolean;
}

const CODE_39_MAP: Record<string, string> = {
  '0': 'nnwwnwnnw', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnnwwnnnn', '7': 'nnnwnwnnw',
  '8': 'wnnwnwnnn', '9': 'nnnwnwnnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'nnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwnnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nnwnwnwnn',
  '/': 'nnwnnwnwn', '+': 'nnwnwnwnn', '%': 'nnnwnwnwn', '*': 'nwnnwnnnn'
};

export default function ReceiptModal({
  isOpen,
  onClose,
  onNewSale,
  transaction,
  storeInfo,
  isDarkMode = false,
}: ReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const handleSaveAsImage = async () => {
    const node = document.getElementById("receipt-content");
    if (!node) return;

    try {
      const dataUrl = await toPng(node, { cacheBust: true, quality: 0.95, pixelRatio: 2 });
      
      // 1. ตรวจสอบและใช้งาน Web Share API (สำหรับมือถือเพื่อให้กดแชร์/บันทึกลงอัลบั้มได้ง่าย)
      const nav = navigator as any;
      if (nav.share && nav.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `receipt-${transaction.id}.png`, { type: "image/png" });
        
        if (nav.canShare({ files: [file] })) {
          await nav.share({
            files: [file],
            title: `ใบเสร็จ ${transaction.id}`,
            text: `ใบเสร็จรับเงิน ${storeInfo.name}`,
          });
          return;
        }
      }

      // 2. สำหรับคอมพิวเตอร์ (Desktop) ดาวน์โหลดไฟล์ปกติ
      const link = document.createElement("a");
      link.download = `receipt-${transaction.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      if (err.name === 'AbortError') return; // ผู้ใช้ยกเลิกการแชร์บนมือถือ

      console.error("Failed to generate receipt image:", err);
      
      // 3. Fallback สำหรับมือถือบางรุ่นที่บล็อก: เปิดรูปในแท็บใหม่เพื่อให้ผู้ใช้กดค้างเซฟรูปได้
      try {
        const dataUrl = await toPng(node, { cacheBust: true, quality: 0.95, pixelRatio: 2 });
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Receipt ${transaction.id}</title></head>
              <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0f0f0;padding:20px;">
                <img src="${dataUrl}" style="max-width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:8px;" alt="Receipt"/>
                <p style="margin-top:15px;font-family:sans-serif;color:#333;font-size:14px;text-align:center;">
                  📱 กดค้างที่รูปภาพแล้วเลือก <b>"Add to Photos"</b> หรือ <b>"บันทึกรูปภาพ"</b> เพื่อบันทึกลงมือถือ
                </p>
              </body>
            </html>
          `);
        } else {
          alert("ไม่สามารถบันทึกรูปภาพได้ กรุณาใช้การแคปหน้าจอ (Screenshot)");
        }
      } catch (innerErr) {
        alert("ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const handleBluetoothPrint = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      alert("เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth (แนะนำให้ใช้ Google Chrome หรือแอป Bluefy บน iOS)");
      return;
    }

    try {
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
        ]
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error("ไม่สามารถเชื่อมต่อเครื่องพิมพ์ผ่าน Bluetooth ได้");

      const services = await server.getPrimaryServices();
      let targetCharacteristic = null;

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              targetCharacteristic = char;
              break;
            }
          }
        } catch (err) {
          console.log("Skip service error:", err);
        }
        if (targetCharacteristic) break;
      }

      if (!targetCharacteristic) {
        throw new Error("ไม่พบช่องทางส่งข้อมูล (Characteristic) ไปยังเครื่องพิมพ์");
      }

      const encoder = new TextEncoder();
      let commands = "\x1B\x40"; 
      
      commands += "\x1B\x61\x01"; 
      commands += `${storeInfo.name || 'STORE'}\n`;
      if (storeInfo.address) commands += `${storeInfo.address}\n`;
      if (storeInfo.phone) commands += `Tel: ${storeInfo.phone}\n`;
      if (storeInfo.taxId) commands += `Tax ID: ${storeInfo.taxId}\n`;
      if (storeInfo.branch) commands += `Branch: ${storeInfo.branch}\n`;
      commands += "--------------------------------\n";
      commands += "ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ\n";
      commands += "--------------------------------\n";

      commands += "\x1B\x61\x00"; 
      commands += `No: ${transaction.id}\n`;
      commands += `Date: ${transaction.date}\n`;
      if (transaction.customerName) commands += `Customer: ${transaction.customerName}\n`;
      if (transaction.tableNumber) commands += `Table: ${transaction.tableNumber}\n`;
      if (transaction.orderType) commands += `Type: ${transaction.orderType}\n`;
      commands += "--------------------------------\n";
      commands += "ITEM           QTY    TOTAL(THB)\n";
      commands += "--------------------------------\n";

      transaction.items.forEach((item) => {
        commands += `${item.name}\n`;
        commands += `  ${item.quantity} ${item.unitName} x ${item.price.toFixed(2)} = ${item.total.toFixed(2)}\n`;
      });
      commands += "--------------------------------\n";

      commands += `Subtotal: ${(transaction.subtotal || transaction.totalAmount).toFixed(2)}\n`;
      if (transaction.discount > 0) {
        commands += `Discount: -${transaction.discount.toFixed(2)}\n`;
      }
      commands += `TOTAL: ${transaction.totalAmount.toFixed(2)} THB\n`;
      commands += `Payment: ${transaction.paymentMethod}\n`;
      commands += `Received: ${transaction.receivedAmount.toFixed(2)}\n`;
      if (transaction.paymentMethod === "CASH") {
        commands += `Change: ${transaction.changeAmount.toFixed(2)}\n`;
      }
      commands += "--------------------------------\n";

      commands += "\x1B\x61\x01"; 
      commands += "*** ขอบคุณที่ใช้บริการ ***\n";
      commands += "Please Come Again\n\n";
      commands += "Powered by Promptbit POS\n\n\n";

      if (transaction.paymentMethod === "CASH") {
        commands += "\x1B\x70\x00\x19\xFA";
      }
      commands += "\x1D\x56\x41\x00";

      const data = encoder.encode(commands);
      const CHUNK_SIZE = 100;
      
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        await targetCharacteristic.writeValue(chunk);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      alert("พิมพ์ใบเสร็จผ่านบลูทูธสำเร็จ!");
    } catch (error: any) {
      console.error(error);
      alert("พิมพ์ไม่สำเร็จ: " + (error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อบลูทูธ"));
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH": return "เงินสด (Cash)";
      case "PROMPTPAY": return "พร้อมเพย์ / สแกนจ่าย (PromptPay)";
      case "CREDIT": return "เงินเชื่อ / ค้างชำระ (Credit)";
      default: return method;
    }
  };

  const renderRealBarcode = (text: string) => {
    const sanitized = '*' + (text || 'TX-000000').toUpperCase().replace(/[^A-Z0-9\-\. \$\/\+\%]/g, '') + '*';
    let x = 10;
    const rects = [];
    const barWidth = 1.2;
    const wideMultiplier = 2.5;

    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      const pattern = CODE_39_MAP[char] || CODE_39_MAP['*'];
      for (let j = 0; j < pattern.length; j++) {
        const isBar = j % 2 === 0;
        const isWide = pattern[j] === 'w';
        const currentWidth = isWide ? barWidth * wideMultiplier : barWidth;
        if (isBar) {
          rects.push(<rect key={`${i}-${j}`} x={x} y="0" width={currentWidth} height="35" fill="black" />);
        }
        x += currentWidth;
      }
      x += barWidth;
    }
    const totalWidth = x + 10;

    return (
      <svg width={totalWidth} height="35" viewBox={`0 0 ${totalWidth} 35`} fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
        {rects}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:p-0 print:bg-transparent print:static print:block animate-fade-in">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:shadow-none print:border-none print:max-h-none print:w-full ${
          isDarkMode ? "bg-[#181818] border-zinc-800" : "bg-slate-50 border-slate-200"
        } print:bg-white`}
      >
        <div className={`flex justify-between items-center px-6 py-4 border-b print:hidden ${
          isDarkMode ? "bg-[#202020] border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-800"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-4 ring-emerald-500/5">
              <Check size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">ทำรายการสำเร็จ</h2>
              <p className="text-[11px] text-slate-400 font-normal">บันทึกข้อมูลและออกใบเสร็จเรียบร้อยแล้ว</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700" 
                : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto print:overflow-visible print:p-0 custom-scrollbar flex-1 flex justify-center">
          <div id="receipt-content" className="receipt-paper w-[320px] bg-white text-slate-900 font-mono text-[11px] p-6 rounded-2xl border border-slate-200/80 shadow-md print:border-none print:p-0 print:m-0 print:shadow-none">
            
            <div className="text-center space-y-1.5 mb-4">
              {storeInfo.logoUrl ? (
                <img src={storeInfo.logoUrl} alt="Logo" className="w-12 h-12 mx-auto object-contain rounded-lg mb-1" />
              ) : (
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-1 shadow-sm">
                  <Store size={20} />
                </div>
              )}
              
              <h1 className="font-extrabold text-sm tracking-widest text-slate-900 uppercase">
                {storeInfo.name}
              </h1>
              
              {storeInfo.address && (
                <p className="text-[10px] text-slate-600 leading-tight max-w-[240px] mx-auto font-sans">
                  {storeInfo.address}
                </p>
              )}
              
              <div className="text-[10px] text-slate-600 flex flex-wrap justify-center gap-x-2 gap-y-0.5 pt-1 font-sans">
                {storeInfo.taxId && <span>Tax ID: {storeInfo.taxId}</span>}
                {storeInfo.branch && <span>({storeInfo.branch})</span>}
              </div>
              {storeInfo.phone && (
                <p className="text-[10px] text-slate-600 font-sans">Tel: {storeInfo.phone}</p>
              )}
            </div>

            <div className="text-center my-3 border-y border-dashed border-slate-300 py-1.5">
              <span className="font-bold text-[11px] tracking-wider uppercase text-slate-900">
                ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
              </span>
              <p className="text-[9px] text-slate-500 uppercase tracking-tight font-sans">Receipt / Tax Invoice (Abbreviated)</p>
            </div>

            <div className="space-y-1 text-[10px] text-slate-700 mb-3 pb-2 border-b border-dashed border-slate-200 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">เลขที่ (No):</span>
                <span className="font-bold text-slate-900">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันที่ (Date):</span>
                <span className="font-medium text-slate-900">{transaction.date}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ลูกค้า:</span>
                  <span className="font-semibold text-slate-900">{transaction.customerName}</span>
                </div>
              )}
              {transaction.tableNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">โต๊ะ / Table:</span>
                  <span className="font-bold text-slate-900">{transaction.tableNumber}</span>
                </div>
              )}
              {transaction.orderType && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ประเภท:</span>
                  <span className="font-medium text-slate-900">{transaction.orderType}</span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-1 mb-1.5 uppercase">
                <span>รายการสินค้า (Item)</span>
                <span>รวม (THB)</span>
              </div>
              
              <div className="space-y-2">
                {transaction.items.map((item) => (
                  <div key={item.cartItemId} className="text-[11px] border-b border-dashed border-slate-100 pb-1.5">
                    <div className="font-semibold text-slate-900 line-clamp-1">{item.name}</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-600 mt-0.5 font-sans">
                      <span>{item.quantity} {item.unitName} × {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-[11px] mb-3 pt-1 border-t border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600 font-sans">
                <span>รวมเป็นเงิน (Subtotal)</span>
                <span>{(transaction.subtotal || transaction.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-sans">
                  <span>ส่วนลด (Discount)</span>
                  <span>-{transaction.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-900 mt-1">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-base">{transaction.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1 mt-2 text-[10px] font-sans">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">วิธีชำระ:</span>
                  <span className="font-semibold">{getPaymentMethodText(transaction.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">รับเงินมา:</span>
                  <span className="font-semibold">{transaction.receivedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</span>
                </div>
                {transaction.paymentMethod === "CASH" && (
                  <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                    <span>เงินทอน (Change):</span>
                    <span>{transaction.changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-2.5 border-t border-b border-dashed border-slate-300 my-3 font-sans">
              <p className="font-bold text-slate-800 text-[11px]">*** ขอบคุณที่ใช้บริการ ***</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Please Come Again</p>
            </div>

            <div className="flex flex-col items-center justify-center my-3">
              {renderRealBarcode(transaction.id)}
              <span className="text-[9px] font-mono tracking-widest text-slate-600 mt-1">*{transaction.id}*</span>
            </div>

            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-center shadow-xs mt-2 font-sans">
              <p className="text-[8px] text-slate-400 tracking-wider uppercase font-medium">
                Powered by
              </p>
              <div className="text-[11px] font-black tracking-widest uppercase text-amber-400 mt-0.5">
                Promptbit POS
              </div>
              <p className="text-[8px] text-slate-300 tracking-tight mt-0.5">
                Professional Multi-Business Retail Platform
              </p>
            </div>

          </div>
        </div>

        <div className={`p-4 border-t space-y-2 print:hidden ${
          isDarkMode ? "bg-[#202020] border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveAsImage}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99]"
            >
              <Download size={16} />
              <span>บันทึกรูปภาพ</span>
            </button>
            <button
              onClick={handleBluetoothPrint}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99]"
            >
              <Printer size={16} />
              <span>พิมพ์บลูทูธ</span>
            </button>
          </div>
          <button
            onClick={onNewSale}
            className={`w-full font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
              isDarkMode 
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <FileText size={16} />
            <span>ทำรายการขายใหม่ (New Sale)</span>
          </button>
        </div>

      </div>
    </div>
  );
}