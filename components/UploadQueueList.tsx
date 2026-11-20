"use client";

import React from "react";
import { CheckCircle2, Loader2, RotateCcw, Trash2, AlertCircle, ChevronRight, Clock } from "lucide-react";
import type { UploadItem } from "@/lib/types";
import { SlipPreview } from "./SlipPreview";

interface UploadQueueListProps {
  items: UploadItem[];
  onOpen: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onSaveAll: () => void;
  onClear: () => void;
  isSavingAll: boolean;
  reviewCount: number;
}

const STATUS: Record<UploadItem["status"], { label: string; cls: string }> = {
  queued: { label: "รอสแกน", cls: "bg-neutral-100 text-neutral-600" },
  scanning: { label: "กำลังสแกน", cls: "bg-blue-50 text-blue-700" },
  review: { label: "รอตรวจทาน", cls: "bg-amber-50 text-amber-800" },
  saving: { label: "กำลังบันทึก", cls: "bg-blue-50 text-blue-700" },
  saved: { label: "บันทึกแล้ว", cls: "bg-emerald-50 text-emerald-700" },
  error: { label: "สแกนไม่สำเร็จ", cls: "bg-red-50 text-red-700" },
};

const baht = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The files of this upload, each with its scan/save status. */
export function UploadQueueList({
  items,
  onOpen,
  onRetry,
  onRemove,
  onSaveAll,
  onClear,
  isSavingAll,
  reviewCount,
}: UploadQueueListProps) {
  if (items.length === 0) return null;
  const busy = items.some((it) => it.status === "scanning" || it.status === "saving") || isSavingAll;

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
        <span className="text-xs font-semibold text-neutral-800">ไฟล์ที่อัปโหลด ({items.length})</span>
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="text-[11px] text-neutral-500 hover:text-neutral-900 disabled:opacity-40"
        >
          ล้างรายการ
        </button>
      </div>

      <ul className="divide-y divide-neutral-100">
        {items.map((it) => {
          const st = STATUS[it.status];
          const amount = it.record?.amount ?? it.draft?.amount ?? it.scan?.amount;
          const date = it.record?.date ?? it.draft?.date ?? it.scan?.date;
          const canOpen = it.status === "review";
          return (
            <li key={it.id} className="flex items-center gap-3 px-3 py-2.5">
              <button
                type="button"
                disabled={!canOpen}
                onClick={() => onOpen(it.id)}
                className="flex flex-1 min-w-0 items-center gap-3 text-left disabled:cursor-default"
              >
                <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                  <SlipPreview url={it.previewUrl} isPdf={it.isPdf} alt={it.file.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-neutral-900">{it.file.name}</div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-neutral-500">
                    {amount !== undefined && it.status !== "error" && (
                      <span className="font-mono font-semibold text-neutral-800">฿{baht(Number(amount))}</span>
                    )}
                    {date && it.status !== "error" && <span>{date}</span>}
                    {it.record?.code && <span className="font-mono">{it.record.code}</span>}
                    {it.error && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {it.error}
                      </span>
                    )}
                  </div>
                </div>
                {canOpen && <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-400" />}
              </button>

              <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.cls}`}>
                {(it.status === "scanning" || it.status === "saving") && <Loader2 className="h-3 w-3 animate-spin" />}
                {it.status === "saved" && <CheckCircle2 className="h-3 w-3" />}
                {it.status === "queued" && <Clock className="h-3 w-3" />}
                {st.label}
              </span>

              {it.status === "error" && (
                <button type="button" title="ลองใหม่" onClick={() => onRetry(it.id)} className="rounded p-1 text-neutral-500 hover:bg-neutral-100">
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {it.status !== "scanning" && it.status !== "saving" && it.status !== "saved" && (
                <button
                  type="button"
                  title="เอาไฟล์ออก"
                  disabled={isSavingAll}
                  onClick={() => onRemove(it.id)}
                  className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {reviewCount > 0 && (
        <div className="border-t border-neutral-100 p-3">
          <button
            type="button"
            onClick={onSaveAll}
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSavingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            บันทึกทั้งหมด ({reviewCount})
          </button>
          <p className="mt-1.5 text-center text-[10px] text-neutral-400">
            บันทึกตามข้อมูลที่ AI สแกน (หรือที่แก้ไขไว้) — กดที่ไฟล์เพื่อตรวจทานก่อนได้
          </p>
        </div>
      )}
    </div>
  );
}
