"use client";

import React from "react";
import { FileText, ExternalLink } from "lucide-react";

interface SlipPreviewProps {
  url: string;
  isPdf: boolean;
  /**
   * cover: fills a fixed box (banner/scanner frame) — PDFs show a document tile.
   * contain: full view (lightbox) — PDFs open in an inline viewer.
   */
  variant?: "cover" | "contain";
  alt?: string;
  className?: string;
  fileName?: string;
}

/** Shows an uploaded slip: images as <img>, PDFs as a tile or inline viewer. */
export function SlipPreview({ url, isPdf, variant = "cover", alt = "Slip", className = "", fileName }: SlipPreviewProps) {
  if (!url) return null;

  if (!isPdf) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={`${variant === "cover" ? "w-full h-full object-cover" : "max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"} ${className}`}
      />
    );
  }

  if (variant === "contain") {
    return (
      <div className={`w-full max-w-3xl h-[85vh] flex flex-col rounded-xl overflow-hidden bg-white shadow-2xl ${className}`}>
        <iframe src={url} title={fileName || "PDF"} className="flex-1 w-full" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-neutral-700 border-t border-neutral-200 hover:bg-neutral-50"
        >
          <ExternalLink className="w-3.5 h-3.5" /> เปิดไฟล์ PDF ในแท็บใหม่
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 bg-neutral-100 text-neutral-600 ${className}`}>
      <FileText className="w-8 h-8 text-red-500" />
      <span className="text-[11px] font-semibold">PDF</span>
      {fileName && <span className="max-w-[80%] truncate text-[10px] text-neutral-500">{fileName}</span>}
    </div>
  );
}
