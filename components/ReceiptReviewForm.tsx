"use client";

import React, { useState } from "react";
import {
  CreateExpensePayload,
  EXPENSE_CATEGORIES,
  EXPENSE_CHANNELS,
  ScanResponse,
} from "@/lib/types";
import {
  CheckCircle2,
  RotateCcw,
  ZoomIn,
  X,
  Store,
  Calendar,
  Tag,
  Hash,
  FileText,
  DollarSign,
  Package,
  Layers,
  User,
} from "lucide-react";
import { getSlipFullUrl } from "@/lib/api";

interface ReceiptReviewFormProps {
  initialData: ScanResponse;
  localPreviewUrl: string;
  userName?: string;
  onSubmit: (data: CreateExpensePayload) => Promise<void>;
  onRetake: () => void;
  isSaving: boolean;
}

export function ReceiptReviewForm({
  initialData,
  localPreviewUrl,
  userName = "ผู้ใช้งานระบบ",
  onSubmit,
  onRetake,
  isSaving,
}: ReceiptReviewFormProps) {
  const [formData, setFormData] = useState<CreateExpensePayload>({
    amount: initialData.amount || 0,
    date: initialData.date || new Date().toISOString().split("T")[0],
    category: initialData.category || "ค่าใช้จ่ายในการบริหาร",
    channel: initialData.channel || "ทั่วไป",
    vendor: initialData.vendor || "",
    invoice_ref: initialData.invoice_ref || "",
    product_name: initialData.product_name || "",
    description: initialData.description || "",
    slip_url: initialData.slip_url || "",
    created_by: userName,
  });

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const slipDisplayUrl = localPreviewUrl || getSlipFullUrl(initialData.slip_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Lightbox / Zoom modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={slipDisplayUrl}
            alt="Receipt Zoom"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Slip Thumbnail Banner & Zoom Trigger */}
      <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group shadow-sm">
        <img
          src={slipDisplayUrl}
          alt="Receipt Thumbnail"
          className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
              AI สแกนสำเร็จ
            </span>
            <span className="text-xs font-medium text-white/95 truncate max-w-[150px]">
              {formData.vendor || "สลิป / ใบเสร็จ"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="flex items-center space-x-1 text-xs text-white bg-black/50 hover:bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>ดูภาพขยาย</span>
          </button>
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Total Amount Big Input */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
            ยอดเงินสุทธิ (บาท) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center space-x-1.5 mt-1">
            <span className="text-2xl font-bold text-neutral-400 font-mono">฿</span>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              className="w-48 text-center text-3xl font-extrabold text-neutral-900 bg-transparent border-b-2 border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors font-mono"
            />
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>วันที่ <span className="text-red-500">*</span></span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Tag className="w-3.5 h-3.5 text-neutral-500" />
              <span>หมวดหมู่ค่าใช้จ่าย</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>ช่องทาง</span>
            </label>
            <select
              value={formData.channel}
              onChange={(e) =>
                setFormData({ ...formData, channel: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            >
              {EXPENSE_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span>ร้านค้า / ผู้รับเงิน</span>
            </label>
            <input
              type="text"
              value={formData.vendor}
              placeholder="เช่น ร้านค้า หรือ บริษัท"
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>

          {/* Invoice / Order Ref */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-neutral-500" />
              <span>เลขที่คำสั่งซื้อ / อ้างอิง</span>
            </label>
            <input
              type="text"
              value={formData.invoice_ref}
              placeholder="Order ID / เลขที่บิล"
              onChange={(e) =>
                setFormData({ ...formData, invoice_ref: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>

          {/* Product Summary */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
              <Package className="w-3.5 h-3.5 text-neutral-500" />
              <span>สินค้า / รายการสิ่งของ <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              placeholder="เช่น กล่องพัสดุ เบอร์ 2A, สก็อตเทปใส"
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>
        </div>

        {/* Itemized Description */}
        <div>
          <label className="text-xs font-semibold text-neutral-700 flex items-center space-x-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>รายละเอียดสินค้า / หมายเหตุ</span>
          </label>
          <textarea
            rows={2}
            value={formData.description}
            placeholder="รายละเอียดและราคาสินค้าแต่ละรายการ"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
          />
        </div>

        {/* User Attribution */}
        <div className="flex items-center space-x-1.5 text-xs text-neutral-500 pt-1">
          <User className="w-3.5 h-3.5 text-neutral-400" />
          <span>บันทึกโดย:</span>
          <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06C755]" />
            <span>{formData.created_by}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isSaving ? "กำลังบันทึกข้อมูล..." : "ยืนยันบันทึกค่าใช้จ่าย"}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={onRetake}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-medium text-sm flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            <span>ถ่ายใหม่</span>
          </button>
        </div>
      </div>
    </form>
  );
}
