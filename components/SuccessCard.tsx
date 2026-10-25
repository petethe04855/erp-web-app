"use client";

import React, { useEffect } from "react";
import { CheckCircle, Camera, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { ExpenseRecord } from "@/lib/types";

interface SuccessCardProps {
  expense: ExpenseRecord;
  onUploadNext: () => void;
}

export function SuccessCard({ expense, onUploadNext }: SuccessCardProps) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#06C755", "#6ee7b7", "#18181b"],
      });
    } catch {
      // Ignore if not supported
    }
  }, []);

  const formattedAmount = Number(expense.amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-3xl p-6 text-center space-y-5 shadow-sm">
      {/* Radiant Checkmark Badge */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-lg font-bold text-neutral-900 mt-3">
          บันทึกค่าใช้จ่ายสำเร็จ!
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          ข้อมูลได้ถูกจัดเก็บเข้าสู่ระบบ Chawy ERP เรียบร้อยแล้ว
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <span className="text-xs text-neutral-500">รหัสเอกสาร</span>
          <span className="text-xs font-mono font-bold text-neutral-900">
            {expense.code || `#EXP-${expense.id}`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">ยอดเงินสุทธิ</span>
          <span className="text-base font-extrabold text-neutral-900 font-mono">
            ฿{formattedAmount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">หมวดหมู่</span>
          <span className="text-xs font-medium text-neutral-800">
            {expense.category}
          </span>
        </div>

        {expense.vendor && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">ร้านค้า / ผู้รับเงิน</span>
            <span className="text-xs font-medium text-neutral-800 truncate max-w-[180px]">
              {expense.vendor}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">วันที่</span>
          <span className="text-xs text-neutral-700">{expense.date}</span>
        </div>
      </div>

      {/* Upload Next Receipt Primary CTA Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onUploadNext}
          className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all"
        >
          <Camera className="w-4 h-4" />
          <span>ถ่าย / อัปโหลดใบเสร็จใบต่อไป</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
