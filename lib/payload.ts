import {
  CreateExpensePayload,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ScanResponse,
  UploadKind,
} from "./types";

/** The record the review card starts from: the AI scan with safe defaults. */
export function buildInitialPayload(
  scan: ScanResponse,
  kind: UploadKind,
  userName: string,
): CreateExpensePayload {
  const categories: readonly string[] = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category =
    scan.category && categories.includes(scan.category)
      ? scan.category
      : kind === "income"
        ? INCOME_CATEGORIES[0]
        : "ค่าใช้จ่ายในการบริหาร";

  return {
    amount: scan.amount || 0,
    date: scan.date || new Date().toISOString().split("T")[0],
    category,
    channel: scan.channel || "ทั่วไป",
    vendor: scan.vendor || "",
    invoice_ref: scan.invoice_ref || "",
    product_name: scan.product_name || "",
    description: scan.description || "",
    slip_url: scan.slip_url || "",
    created_by: userName,
  };
}
