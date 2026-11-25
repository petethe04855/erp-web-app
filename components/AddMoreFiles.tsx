"use client";

import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { partitionFiles, UPLOAD_ACCEPT } from "@/lib/files";

interface AddMoreFilesProps {
  onFilesSelected: (files: File[]) => void;
  onRejected?: (messages: string[]) => void;
  disabled?: boolean;
}

/**
 * "Add more slips" while the first file is being scanned or reviewed. Some
 * pickers (e.g. the LINE in-app browser) return only one file per pick even
 * with `multiple`, so files can be picked again and again and they queue up.
 */
export function AddMoreFiles({ onFilesSelected, onRejected, disabled = false }: AddMoreFilesProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        multiple
        className="hidden"
        disabled={disabled}
        data-testid="add-more-input"
        onChange={(e) => {
          const { accepted, rejected } = partitionFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
          if (rejected.length) onRejected?.(rejected);
          if (accepted.length) onFilesSelected(accepted);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>เลือกสลิปเพิ่ม (เลือกได้หลายครั้ง)</span>
      </button>
    </>
  );
}
