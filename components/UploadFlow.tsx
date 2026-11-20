"use client";

import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { ImageDropzone } from "./ImageDropzone";
import { ScanningState } from "./ScanningState";
import { ReceiptReviewForm } from "./ReceiptReviewForm";
import { SuccessCard } from "./SuccessCard";
import { SessionHistory } from "./SessionHistory";
import { UploadQueueList } from "./UploadQueueList";
import { useUploadQueue } from "@/lib/useUploadQueue";
import { buildInitialPayload } from "@/lib/payload";
import type {
  CreateExpensePayload,
  ExpenseRecord,
  ScanResponse,
  UploadItem,
  UploadKind,
} from "@/lib/types";

interface UploadFlowProps {
  kind: UploadKind;
  userName: string;
  scanFn: (file: File) => Promise<ScanResponse>;
  createFn: (payload: CreateExpensePayload) => Promise<ExpenseRecord>;
}

const COPY = {
  expense: {
    scanError: "ไม่สามารถสแกนใบเสร็จได้ กรุณาลองใหม่อีกครั้ง",
    saveError: "บันทึกค่าใช้จ่ายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },
  income: {
    scanError: "ไม่สามารถสแกนสลิปรายรับได้ กรุณาลองใหม่อีกครั้ง",
    saveError: "บันทึกรายรับไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },
} as const;

/**
 * Upload → scan → review → save, for one or many files (1 file = 1 record).
 * A single file keeps the old one-step flow; several files show a list where
 * each can be reviewed and saved, or all saved at once.
 */
export function UploadFlow({ kind, userName, scanFn, createFn }: UploadFlowProps) {
  const copy = COPY[kind];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionRecords, setSessionRecords] = useState<ExpenseRecord[]>([]);
  const [lastSaved, setLastSaved] = useState<ExpenseRecord | null>(null);
  // Files the dropzone refused; kept here so the note survives the view change.
  const [rejected, setRejected] = useState<string[]>([]);

  const withUser = (p: CreateExpensePayload): CreateExpensePayload => ({ ...p, created_by: userName });

  const queue = useUploadQueue({
    scanFn,
    createFn: (p) => createFn(withUser(p)),
    buildPayload: (scan) => buildInitialPayload(scan, kind, userName),
    scanErrorText: copy.scanError,
    saveErrorText: copy.saveError,
    // One file on its own: open its review card as soon as it is scanned.
    onScanned: (id: string, items: UploadItem[]) => {
      if (items.filter((it) => it.status !== "saved").length === 1) {
        setSelectedId((cur) => cur ?? id);
      }
    },
  });

  const recordSaved = (records: ExpenseRecord[]) => {
    if (records.length === 0) return;
    setSessionRecords((prev) => [...records.slice().reverse(), ...prev]);
    setLastSaved(records[records.length - 1]);
  };

  const active = queue.items.filter((it) => it.status !== "saved");
  const selected = queue.items.find((it) => it.id === selectedId && it.status !== "saved") ?? null;

  const handleSave = async (item: UploadItem, data: CreateExpensePayload) => {
    const record = await queue.save(item.id, data);
    if (!record) return; // error is shown on the card
    recordSaved([record]);
    const next = queue.items.find((it) => it.id !== item.id && it.status === "review");
    setSelectedId(next ? next.id : null);
  };

  const handleSaveAll = async () => {
    setSelectedId(null);
    recordSaved(await queue.saveAll());
  };

  const startOver = () => {
    queue.reset();
    setSelectedId(null);
    setLastSaved(null);
  };

  const rejectedNote = rejected.length > 0 && (
    <div
      role="alert"
      className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-800"
    >
      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-0.5">
        <div className="font-semibold">ไม่ได้เพิ่มไฟล์ต่อไปนี้</div>
        {rejected.map((r) => (
          <div key={r}>{r}</div>
        ))}
      </div>
      <button type="button" aria-label="ปิด" onClick={() => setRejected([])} className="text-amber-600 hover:text-amber-900">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {rejectedNote}
      {renderView()}
    </div>
  );

  function renderView() {
    // 1. Reviewing one file
    if (selected && selected.scan) {
      return (
        <ReceiptReviewForm
          key={selected.id}
          kind={kind}
          initialData={selected.scan}
          localPreviewUrl={selected.previewUrl}
          isPdf={selected.isPdf}
          fileName={selected.file.name}
          draft={selected.draft}
          onChange={(d) => queue.updateDraft(selected.id, d)}
          userName={userName}
          error={selected.error}
          onSubmit={(d) => handleSave(selected, d)}
          onRetake={() => {
            if (active.length === 1) {
              // single-file flow: "ถ่ายใหม่" drops this file
              queue.remove(selected.id);
            }
            setSelectedId(null);
          }}
          secondaryLabel={active.length > 1 ? "กลับไปรายการไฟล์" : "ถ่ายใหม่"}
          isSaving={selected.status === "saving"}
        />
      );
    }

    // 2. A single file being scanned: keep the full scanning animation
    if (active.length === 1 && (active[0].status === "scanning" || active[0].status === "queued")) {
      return (
        <ScanningState
          kind={kind}
          previewUrl={active[0].previewUrl}
          isPdf={active[0].isPdf}
          fileName={active[0].file.name}
        />
      );
    }

    // 3. Everything in this upload is saved
    if (queue.items.length > 0 && active.length === 0 && lastSaved) {
      return (
        <div className="space-y-4">
          <SuccessCard kind={kind} expense={lastSaved} count={queue.savedCount} onUploadNext={startOver} />
          <SessionHistory kind={kind} items={sessionRecords} />
        </div>
      );
    }

    // 4. Upload area + list of files
    return (
      <div className="space-y-4">
        <ImageDropzone
          kind={kind}
          onFilesSelected={queue.addFiles}
          onRejected={setRejected}
          disabled={queue.isSavingAll}
        />
        {active.length > 0 && (
          <UploadQueueList
            items={queue.items}
            onOpen={setSelectedId}
            onRetry={queue.retry}
            onRemove={queue.remove}
            onSaveAll={handleSaveAll}
            onClear={startOver}
            isSavingAll={queue.isSavingAll}
            reviewCount={queue.reviewCount}
          />
        )}
        <SessionHistory kind={kind} items={sessionRecords} />
      </div>
    );
  }
}
