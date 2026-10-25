"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, UploadCloud, Clipboard, Sparkles } from "lucide-react";

interface ImageDropzoneProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export function ImageDropzone({ onImageSelected, disabled = false }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
      e.target.value = "";
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            onImageSelected(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onImageSelected]);

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

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelected(file);
    }
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
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Main Big Camera Trigger Button */}
      <button
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
            <span>ถ่ายภาพสลิปทันที</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            เปิดกล้องถ่ายใบเสร็จ / สลิปโอนเงิน เพื่อสแกนด้วย AI
          </p>
        </div>
      </button>

      {/* Drag & Drop / Gallery Picker Secondary Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => galleryInputRef.current?.click()}
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
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200 hidden sm:flex">
            <UploadCloud className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200 hidden sm:flex">
            <Clipboard className="w-4 h-4 text-neutral-700" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">
            เลือกรูปภาพจากคลัง หรือลากไฟล์มาวาง
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            รองรับ JPG, PNG, WebP (หรือกด Ctrl+V เพื่อวางรูปภาพได้ทันที)
          </p>
        </div>
      </div>
    </div>
  );
}
