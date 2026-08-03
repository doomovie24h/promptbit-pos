/**
 * @fileoverview Standard Convenience Store Receipt Modal Component for Promptbit POS
 * @module components/pos/ReceiptModal
 */

"use client";

import React from "react";
import { X, Printer, FileText, Check, Download } from "lucide-react";
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

      const link = document.createElement("a");
      link.download = `receipt-${transaction.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      try {
        const dataUrl = await toPng(node, { cacheBust: true, quality: 0.95, pixelRatio: 2 });
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Receipt ${transaction.id}</title></head>
              <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0f0f0;padding:20px;">
                <img src="${dataUrl}" style="max-width:100%;box-shadow:0 2px 8px rgba(0,0,0,0.1);background:#fff;" alt="Receipt"/>
                <p style="margin-top:15px;font-family:sans-serif;color:#333;font-size:14px;text-align:center;">
                  📱 กดค้างที่รูปภาพแล้วเลือก <b>"บันทึกรูปภาพ"</b> เพื่อเซฟลงเครื่อง
                </p>
              </body>
            </html>
          `);
        } else {
          alert("ไม่สามารถบันทึกรูปภาพได้ กรุณาใช้การแคปหน้าจอ");
        }
      } catch (innerErr) {
        alert("ไม่สามารถบันทึกรูปภาพได้");
      }
    }
  };

  const handleBluetoothPrint = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      alert("เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth");
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
      if (!server) throw new Error("ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้");

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
        throw new Error("ไม่พบช่องทางส่งข้อมูลไปยังเครื่องพิมพ์");
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
      commands += "THANK YOU\n\n\n";

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

      alert("พิมพ์ใบเสร็จสำเร็จ");
    } catch (error: any) {
      console.error(error);
      alert("พิมพ์ไม่สำเร็จ: " + (error.message || "เกิดข้อผิดพลาด"));
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH": return "เงินสด";
      case "PROMPTPAY": return "พร้อมเพย์";
      case "CREDIT": return "เงินเชื่อ";
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
          rects.push(<rect key={`${i}-${j}`} x={x} y="0" width={currentWidth} height="30" fill="black" />);
        }
        x += currentWidth;
      }
      x += barWidth;
    }
    const totalWidth = x + 10;

    return (
      <svg width={totalWidth} height="30" viewBox={`0 0 ${totalWidth} 30`} fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
        {rects}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 print:p-0 print:bg-transparent print:static print:block">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-300">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-100 border-b border-slate-200 print:hidden">
          <span className="font-bold text-xs text-slate-700">พิมพ์ใบเสร็จ</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1">
            <X size={16} />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-50 print:bg-white print:p-0">
          <div id="receipt-content" className="w-[300px] bg-white text-black font-mono text-[11px] p-4 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
            
            {/* Store Details */}
            <div className="text-center space-y-0.5 mb-3">
              <div className="font-bold text-xs uppercase">{storeInfo.name}</div>
              {storeInfo.address && <div className="text-[10px]">{storeInfo.address}</div>}
              <div className="text-[10px]">
                {storeInfo.taxId && <span>Tax ID: {storeInfo.taxId} </span>}
                {storeInfo.branch && <span>({storeInfo.branch})</span>}
              </div>
              {storeInfo.phone && <div className="text-[10px]">Tel: {storeInfo.phone}</div>}
            </div>

            <div className="text-center border-b border-dashed border-black pb-2 mb-2 text-[10px] font-bold">
              ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
            </div>

            {/* Transaction Meta */}
            <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-black mb-2">
              <div className="flex justify-between">
                <span>เลขที่:</span>
                <span>{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span>วันที่:</span>
                <span>{transaction.date}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span>ลูกค้า:</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
              {transaction.tableNumber && (
                <div className="flex justify-between">
                  <span>โต๊ะ:</span>
                  <span>{transaction.tableNumber}</span>
                </div>
              )}
              {transaction.orderType && (
                <div className="flex justify-between">
                  <span>ประเภท:</span>
                  <span>{transaction.orderType}</span>
                </div>
              )}
            </div>

            {/* Items Header */}
            <div className="border-b border-black pb-1 mb-1 flex justify-between text-[10px] font-bold">
              <span>รายการ</span>
              <span>จำนวน / ราคา</span>
            </div>

            {/* Items List */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-black mb-2">
              {transaction.items.map((item) => (
                <div key={item.cartItemId} className="text-[10px]">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="flex justify-between text-[10px]">
                    <span>{item.quantity} {item.unitName} x {item.price.toFixed(2)}</span>
                    <span className="font-bold">{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-black mb-2">
              <div className="flex justify-between">
                <span>รวมเป็นเงิน</span>
                <span>{(transaction.subtotal || transaction.totalAmount).toFixed(2)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between">
                  <span>ส่วนลด</span>
                  <span>-{transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                <span>ยอดสุทธิ</span>
                <span>{transaction.totalAmount.toFixed(2)} THB</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-black mb-3">
              <div className="flex justify-between">
                <span>วิธีชำระ:</span>
                <span>{getPaymentMethodText(transaction.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span>รับเงินมา:</span>
                <span>{transaction.receivedAmount.toFixed(2)}</span>
              </div>
              {transaction.paymentMethod === "CASH" && (
                <div className="flex justify-between font-bold">
                  <span>เงินทอน:</span>
                  <span>{transaction.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="text-center space-y-2">
              <div className="text-[10px] font-bold">*** ขอบคุณที่ใช้บริการ ***</div>
              <div className="flex flex-col items-center justify-center my-1">
                {renderRealBarcode(transaction.id)}
                <span className="text-[9px] mt-0.5">*{transaction.id}*</span>
              </div>
              <div className="text-[8px] text-slate-500 pt-1">
                Powered by Promptbit POS
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveAsImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <Download size={14} />
              <span>บันทึกรูป</span>
            </button>
            <button
              onClick={handleBluetoothPrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <Printer size={14} />
              <span>พิมพ์บลูทูธ</span>
            </button>
          </div>
          <button
            onClick={onNewSale}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded text-xs flex items-center justify-center gap-1 border border-slate-300"
          >
            <FileText size={14} />
            <span>ทำรายการใหม่ (New Sale)</span>
          </button>
        </div>

      </div>
    </div>
  );
}