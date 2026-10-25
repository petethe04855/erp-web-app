"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface ScanningStateProps {
  previewUrl: string;
}

export function ScanningState({ previewUrl }: ScanningStateProps) {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
      {/* Scanner Visual Frame */}
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-neutral-300 shadow-md bg-neutral-900">
        {/* Receipt Image Preview */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Receipt Scanning"
            className="w-full h-full object-cover filter brightness-90 contrast-105"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Laser Scanning Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_3px_rgba(52,211,153,0.8)] animate-scan-line pointer-events-none" />

        {/* Reticles */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl-sm" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr-sm" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl-sm" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br-sm" />
      </div>

      {/* Progress & Text */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-neutral-800">
            Gemini AI กำลังวิเคราะห์ใบเสร็จ...
          </span>
        </div>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto">
          ระบบกำลังอ่านยอดเงินสุทธิ, วันที่, ร้านค้า และหมวดหมู่ค่าใช้จ่าย
        </p>
      </div>
    </div>
  );
}
