import axios from "axios";
import { CreateExpensePayload, ExpenseRecord, ScanResponse } from "./types";

// Determine base API URL:
// 1. Explicit NEXT_PUBLIC_EXPENSE_API_URL if configured
// 2. Default to same-origin "/api/expense" proxy (configured in next.config.ts)
//    which works on both localhost, local Wi-Fi, and Cloudflare Tunnels without CORS or Mixed Content!
function resolveApiBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_EXPENSE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.trim() !== "") {
    const clean = envUrl.trim().replace(/\/+$/, "");
    return clean.endsWith("/api/v1") || clean.endsWith("/api/expense")
      ? clean
      : `${clean}/api/v1`;
  }

  // Same-origin Next.js proxy
  return "/api/expense";
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 60000,
});

/**
 * Uploads an image file to scan receipt via erp-expense-api.
 */
export async function scanReceiptApi(file: File): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<{
    success: boolean;
    data: ScanResponse;
    message?: string;
  }>("/scan", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to scan receipt");
  }

  return response.data.data;
}

/**
 * Creates an expense record via erp-expense-api.
 */
export async function createExpenseApi(
  payload: CreateExpensePayload
): Promise<ExpenseRecord> {
  const response = await apiClient.post<{
    success: boolean;
    data: ExpenseRecord;
    message?: string;
  }>("/expenses", payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create expense");
  }

  return response.data.data;
}

/**
 * Helper to construct the full image URL.
 */
export function getSlipFullUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If in browser and on a non-localhost domain (e.g. Cloudflare tunnel),
  // use relative path which is proxied by Next.js /uploads rewrite
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return cleanPath;
  }

  const backendHost =
    process.env.NEXT_PUBLIC_BACKEND_HOST || "http://localhost:8085";
  return `${backendHost}${cleanPath}`;
}
