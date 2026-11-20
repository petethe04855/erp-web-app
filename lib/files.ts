/** Files the scan API accepts: images and PDF, up to 10 MB each. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const ALLOWED_EXT = /\.(png|jpe?g|webp|pdf)$/i;

export const UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function isPdfUrl(url?: string): boolean {
  if (!url) return false;
  return /\.pdf$/i.test(url.split(/[?#]/)[0]);
}

/** Returns why a file cannot be uploaded, or null when it is fine. */
export function rejectReason(file: File): string | null {
  const typeOk = file.type ? ALLOWED_TYPES.includes(file.type) : ALLOWED_EXT.test(file.name);
  if (!typeOk) return "รองรับเฉพาะ JPG, PNG, WebP หรือ PDF";
  if (file.size > MAX_UPLOAD_BYTES) return "ไฟล์ใหญ่เกิน 10 MB";
  if (file.size === 0) return "ไฟล์ว่างเปล่า";
  return null;
}

/** Splits files into the ones to upload and the rejected ones (with reasons). */
export function partitionFiles(files: File[]): { accepted: File[]; rejected: string[] } {
  const accepted: File[] = [];
  const rejected: string[] = [];
  for (const f of files) {
    const reason = rejectReason(f);
    if (reason) rejected.push(`${f.name}: ${reason}`);
    else accepted.push(f);
  }
  return { accepted, rejected };
}
