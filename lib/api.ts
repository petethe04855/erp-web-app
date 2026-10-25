import axios from "axios";
import { CreateExpensePayload, ExpenseRecord, ScanResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * Uploads an image file to scan receipt via Next.js internal API proxy or directly.
 */
export async function scanReceiptApi(file: File): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post<{
    success: boolean;
    data: ScanResponse;
    message?: string;
  }>("/api/scan", formData, {
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
 * Creates an expense record via Next.js internal API proxy or directly.
 */
export async function createExpenseApi(
  payload: CreateExpensePayload
): Promise<ExpenseRecord> {
  const response = await axios.post<{
    success: boolean;
    data: ExpenseRecord;
    message?: string;
  }>("/api/expenses", payload);

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
  const backendHost =
    process.env.NEXT_PUBLIC_BACKEND_HOST || "http://localhost:8084";
  return `${backendHost}${path.startsWith("/") ? "" : "/"}${path}`;
}
