/**
 * @fileoverview Standard Receipt Modal Component for Promptbit POS (Mixue Receipt Style)
 * @module components/pos/ReceiptModal
 */

"use client";

import React from "react";
import { X, Printer, FileText, Download } from "lucide-react";
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
      if (transaction.orderType) commands += `${transaction.orderType}${transaction.tableNumber ? '#' + transaction.tableNumber : ''}\n`;
      commands += "--------------------------------\n";

      commands += "\x1B\x61\x00"; 
      commands += `หมายเลขเอกสาร: ${transaction.id}\n`;
      commands += `เวลาสั่งซื้อ: ${transaction.date}\n`;
      commands += "--------------------------------\n";
      commands += "ชื่อ          ราคาต่อหน่วย  จำนวน    รวม\n";
      commands += "--------------------------------\n";

      let totalQty = 0;
      transaction.items.forEach((item) => {
        totalQty += item.quantity;
        commands += `${item.name}\n`;
        commands += `              ${item.price.toFixed(2)}     ${item.quantity}   ${item.total.toFixed(2)}\n`;
      });
      commands += "--------------------------------\n";

      const subtotal = transaction.subtotal || transaction.totalAmount;
      const vat = transaction.tax || (subtotal * 7 / 107);
      const exclVat = subtotal - vat;

      commands += `รวม                        ${totalQty}   ${subtotal.toFixed(2)}\n`;
      commands += `จำนวนเงินที่ไม่รวมภาษี               ${exclVat.toFixed(2)}\n`;
      commands += `VAT(7.00%)                          ${vat.toFixed(2)}\n`;
      commands += `ต้องเก็บ                            ${subtotal.toFixed(2)}\n`;
      commands += "--------------------------------\n";

      const paymentText = transaction.paymentMethod === "CASH" ? "เงินสด" : transaction.paymentMethod === "PROMPTPAY" ? "PromptPay" : "เงินเชื่อ";
      commands += `1.${paymentText}                           ${subtotal.toFixed(2)}\n`;
      commands += "--------------------------------\n";
      if (transaction.cashierName) commands += `พนักงานรับเงิน: ${transaction.cashierName}\n`;
      if (storeInfo.address) commands += `ที่อยู่: ${storeInfo.address}\n`;
      if (storeInfo.phone) commands += `โทรศัพท์: ${storeInfo.phone}\n`;
      commands += `เวลา: ${new Date().toLocaleString('th-TH')}\n\n\n`;

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

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "CASH": return "เงินสด";
      case "PROMPTPAY": return "PromptPay";
      case "CREDIT": return "เงินเชื่อ";
      default: return method;
    }
  };

  const subtotal = transaction.subtotal || transaction.totalAmount;
  const vat = transaction.tax || (subtotal * 7 / 107);
  const exclVat = subtotal - vat;
  const totalQty = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

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
            
            {/* Store Header & Logo */}
            <div className="text-center space-y-1 mb-2">
              {storeInfo.logoUrl ? (
                <div className="flex justify-center mb-1">
                  <img src={storeInfo.logoUrl} alt="Logo" className="h-12 max-w-[120px] object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg mb-1">
                  {storeInfo.name ? storeInfo.name.charAt(0) : 'S'}
                </div>
              )}
              <div className="font-bold text-sm uppercase tracking-wide">{storeInfo.name}</div>
              {storeInfo.website && <div className="text-[9px] text-slate-600">{storeInfo.website}</div>}
            </div>

            {/* Order Type / Table Number Highlight */}
            {(transaction.orderType || transaction.tableNumber) && (
              <div className="text-center font-bold text-sm my-2 pb-2 border-b border-dashed border-black">
                {transaction.orderType || 'ทานในร้าน'}{transaction.tableNumber ? `#${transaction.tableNumber}` : ''}
              </div>
            )}

            {/* Document Info */}
            <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-black mb-2">
              <div className="flex justify-between">
                <span>หมายเลขเอกสาร:</span>
                <span className="font-semibold">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span>เวลาสั่งซื้อ:</span>
                <span>{transaction.date}</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="flex justify-between pb-1 mb-1 border-b border-black text-[10px] font-bold">
              <span className="w-[40%]">ชื่อ</span>
              <span className="w-[25%] text-right">ราคาต่อหน่วย</span>
              <span className="w-[15%] text-right">จำนวน</span>
              <span className="w-[20%] text-right">รวม</span>
            </div>

            {/* Items List */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-black mb-2">
              {transaction.items.map((item) => (
                <div key={item.cartItemId} className="text-[10px]">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span className="w-[40%]"></span>
                    <span className="w-[25%] text-right">{item.price.toFixed(2)}</span>
                    <span className="w-[15%] text-right">{item.quantity}</span>
                    <span className="w-[20%] text-right font-bold">{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Totals */}
            <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-black mb-2">
              <div className="flex justify-between">
                <span>รวม</span>
                <div className="flex space-x-6">
                  <span>{totalQty}</span>
                  <span className="font-bold">{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>จำนวนเงินที่ไม่รวมภาษี</span>
                <span>{exclVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>VAT (7.00%)</span>
                <span>{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                <span>ต้องเก็บ</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-black mb-3">
              <div className="flex justify-between font-medium">
                <span>1.{getPaymentMethodName(transaction.paymentMethod)}</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              {transaction.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>รับเงินมา:</span>
                    <span>{transaction.receivedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>เงินทอน:</span>
                    <span>{transaction.changeAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Meta */}
            <div className="space-y-0.5 text-[9px] text-slate-700">
              {transaction.cashierName && <div>พนักงานรับเงิน: {transaction.cashierName}</div>}
              {storeInfo.address && <div>ที่อยู่: {storeInfo.address}</div>}
              {storeInfo.phone && <div>โทรศัพท์: {storeInfo.phone}</div>}
              <div>เวลา: {new Date().toLocaleString('th-TH')}</div>
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