export type ExpenseCategory =
  | "ค่าโฆษณา"
  | "ค่าธรรมเนียมแพลตฟอร์ม"
  | "ต้นทุนขาย/วัตถุดิบ"
  | "ค่าใช้จ่ายในการบริหาร"
  | "ค่าขนส่ง"
  | "ค่าแรง/เงินเดือน"
  | "อื่นๆ";

export type ExpenseChannel = "LINE" | "Shopee" | "TikTok" | "Manual" | "ทั่วไป";

export type UploadKind = "expense" | "income";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "ต้นทุนขาย/วัตถุดิบ",
  "ค่าใช้จ่ายในการบริหาร",
  "ค่าขนส่ง",
  "ค่าแรง/เงินเดือน",
  "อื่นๆ",
];

export const EXPENSE_CHANNELS: ExpenseChannel[] = [
  "LINE",
  "ทั่วไป",
  "Shopee",
  "TikTok",
  "Manual",
];

export interface ReceiptData {
  amount: number;
  date: string;
  vendor: string;
  invoice_ref: string;
  product_name: string;
  category: string;
  channel: string;
  description: string;
}

export interface ScanResponse extends ReceiptData {
  slip_url: string;
}

export interface ExpenseRecord {
  id: number;
  code: string;
  date: string;
  category: ExpenseCategory;
  channel: ExpenseChannel;
  amount: number;
  product_name: string;
  purchase_url?: string;
  slip_url?: string;
  vendor?: string;
  invoice_ref?: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface CreateExpensePayload {
  date: string;
  category: string;
  channel: string;
  amount: number;
  product_name: string;
  purchase_url?: string;
  slip_url?: string;
  vendor?: string;
  invoice_ref?: string;
  description?: string;
  created_by?: string;
}

// ---------- Income ----------

export type IncomeCategory =
  | "ยอดขาย LINE"
  | "ยอดขาย Shopee"
  | "ยอดขาย TikTok"
  | "ยอดขายหน้าร้าน"
  | "ค่าธรรมเนียมการชำระเงิน"
  | "รายได้อื่นๆ";

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "ยอดขาย LINE",
  "ยอดขาย Shopee",
  "ยอดขาย TikTok",
  "ยอดขายหน้าร้าน",
  "ค่าธรรมเนียมการชำระเงิน",
  "รายได้อื่นๆ",
];

// Income records share the same data shape as expenses
// (code prefix INC-, but identical fields from erp-expense-api)
export type IncomeRecord = ExpenseRecord;

export type CreateIncomePayload = CreateExpensePayload;

// ---------- Multi-file upload queue ----------

export type UploadStatus =
  | "queued" // waiting to be scanned
  | "scanning"
  | "review" // scanned, waiting for the user to check and save
  | "saving"
  | "saved"
  | "error"; // scan failed (retry re-scans)

export interface UploadItem {
  id: string;
  file: File;
  /** Object URL of the local file (images and PDFs). */
  previewUrl: string;
  isPdf: boolean;
  status: UploadStatus;
  scan?: ScanResponse;
  /** Edits made in the review card that are not saved yet. */
  draft?: CreateExpensePayload;
  record?: ExpenseRecord;
  error?: string;
}
