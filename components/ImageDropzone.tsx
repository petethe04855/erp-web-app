"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Clipboard,
  Sparkles,
  FileText,
  AlertCircle,
} from "lucide-react";
import { partitionFiles, UPLOAD_ACCEPT } from "@/lib/files";

interface ImageDropzoneProps {
  /** Valid files (images or PDF, ≤10 MB); invalid ones are listed in the dropzone. */
  onFilesSelected: (files: File[]) => void;
  /** Receives the rejected files ("name: reason"); the parent shows them. */
  onRejected?: (messages: string[]) => void;
  disabled?: boolean;
  kind?: "expense" | "income";
}

const DROPZONE_COPY = {
  expense: {
    title: "ถ่ายภาพสลิปทันที",
    subtitle: "เปิดกล้องถ่ายใบเสร็จ / สลิปโอนเงิน เพื่อสแกนด้วย AI",
  },
  income: {
    title: "ถ่ายภาพสลิปรายรับทันที",
    subtitle: "เปิดกล้องถ่ายสลิปการชำระเงิน (รายรับ) เพื่อสแกนด้วย AI",
  },
} as const;

export function ImageDropzone({
  onFilesSelected,
  onRejected,
  disabled = false,
  kind = "expense",
}: ImageDropzoneProps) {
  const copy = DROPZONE_COPY[kind];
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const takeFiles = (files: File[]) => {
    if (files.length === 0) return;
    const { accepted, rejected: bad } = partitionFiles(files);
    if (onRejected) onRejected(bad);
    else setRejected(bad);
    if (accepted.length) onFilesSelected(accepted);
  };

  // Latest takeFiles for the window paste listener
  const takeFilesRef = useRef(takeFiles);
  useEffect(() => {
    takeFilesRef.current = takeFiles;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    takeFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  // Clipboard paste listener (Ctrl+V): takes every pasted file
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      takeFilesRef.current(files);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    takeFiles(Array.from(e.dataTransfer.files ?? []));
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Main Big Camera Trigger Button */}
      {/* <button
        type="button"
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
        className="w-full relative overflow-hidden group bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white rounded-2xl p-6 shadow-sm border border-neutral-800 transition-all flex flex-col items-center justify-center space-y-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Camera className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <div className="text-base font-bold tracking-wide flex items-center justify-center space-x-1.5">
            <span>{copy.title}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{copy.subtitle}</p>
        </div>
      </button> */}

      {/* Drag & Drop / Gallery Picker Secondary Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && galleryInputRef.current?.click()}
        className={`w-full rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 bg-white ${
          isDragging
            ? "border-neutral-900 bg-neutral-50 scale-[1.01]"
            : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center space-x-2.5 text-neutral-500">
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200">
            <ImageIcon className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200">
            <FileText className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200 hidden sm:flex">
            <UploadCloud className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200 hidden sm:flex">
            <Clipboard className="w-4 h-4 text-neutral-700" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">
            เลือกไฟล์จากคลัง หรือลากไฟล์มาวาง
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            รองรับ JPG, PNG, WebP, PDF · เลือกได้หลายไฟล์ (ไม่เกิน 10 MB ต่อไฟล์ หรือกด Ctrl+V เพื่อวางรูป)
          </p>
        </div>
      </div>

      {rejected.length > 0 && (
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
        </div>
      )}
    </div>
  );
}
