"use client";

import Link from "next/link";
import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { LineLoginGate } from "@/components/LineLoginGate";
import { Receipt, TrendingUp, ChevronRight } from "lucide-react";

const entries = [
  {
    href: "/expense",
    title: "ลงค่าใช้จ่าย",
    description: "อัปโหลดรูปใบเสร็จ / สลิป สแกนและบันทึกรายการค่าใช้จ่าย",
    icon: <Receipt className="w-6 h-6 text-white" />,
    accent: "bg-neutral-900",
  },
  {
    href: "/income",
    title: "ลงรายรับ",
    description: "อัปโหลดรูปสลิปการชำระเงิน บันทึกรายการรายรับ",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    accent: "bg-emerald-600",
  },
];

export default function HomePage() {
  return (
    <LineLoginGate>
      <main className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-start p-4 sm:p-6 relative">
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto space-y-4">
          <AppHeader
            title="Chawy ERP"
            subtitle="เลือกประเภทรายการที่ต้องการบันทึก"
            icon={
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3h7v7H3z" />
                <path d="M14 3h7v7h-7z" />
                <path d="M3 14h7v7H3z" />
                <path d="M14 14h7v7h-7z" />
              </svg>
            }
          />

          <p className="text-xs text-neutral-500 text-center pt-1">
            กรุณาเลือกว่าคุณต้องการลงรายการ{" "}
            <span className="font-semibold text-neutral-800">ค่าใช้จ่าย</span>{" "}
            หรือ{" "}
            <span className="font-semibold text-neutral-800">รายรับ</span>
          </p>

          {/* Entry Buttons */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="block bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-neutral-300 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${entry.accent}`}
                  >
                    {entry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                      {entry.title}
                    </h2>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      {entry.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </LineLoginGate>
  );
}
