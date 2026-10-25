"use client";

import React, { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { ExpenseRecord } from "@/lib/types";

interface SessionHistoryProps {
  items: ExpenseRecord[];
}

export function SessionHistory({ items }: SessionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-semibold text-neutral-800">
            ประวัติการบันทึกในรอบนี้ ({items.length} รายการ)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-3 divide-y divide-neutral-100 max-h-60 overflow-y-auto">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 truncate pr-2">
                <div className="font-semibold text-neutral-900 truncate">
                  {item.vendor || item.product_name || "ค่าใช้จ่ายทั่วไป"}
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center space-x-2">
                  <span className="font-mono font-medium text-neutral-800">
                    {item.code || `#${item.id}`}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-neutral-900 font-mono">
                  ฿
                  {Number(item.amount || 0).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
