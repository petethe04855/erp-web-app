"use client";

import React, { useState } from "react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { ScanningState } from "@/components/ScanningState";
import { ReceiptReviewForm } from "@/components/ReceiptReviewForm";
import { SuccessCard } from "@/components/SuccessCard";
import { SessionHistory } from "@/components/SessionHistory";
import { AppHeader } from "@/components/AppHeader";
import { LineLoginGate } from "@/components/LineLoginGate";
import { useLiff } from "@/components/LiffProvider";
import {
  CreateExpensePayload,
  ExpenseRecord,
  ScanResponse,
} from "@/lib/types";
import { scanReceiptApi, createExpenseApi } from "@/lib/api";
import {
  Receipt,
  AlertCircle,
} from "lucide-react";

type AppStep = "idle" | "scanning" | "review" | "success";

export default function ExpenseUploadPage() {
  const { profile } = useLiff();

  // Flow State
  const [step, setStep] = useState<AppStep>("idle");
  const [localPreview, setLocalPreview] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [savedExpense, setSavedExpense] = useState<ExpenseRecord | null>(null);
  const [sessionExpenses, setSessionExpenses] = useState<ExpenseRecord[]>([]);

  // Loading & Error States
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeUserName = profile
    ? `${profile.displayName} (LINE ID: ${profile.userId})`
    : "พนักงาน";

  // 1. Handle image selected
  const handleImageSelected = async (file: File) => {
    setErrorMessage(null);

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setStep("scanning");

    try {
      const result = await scanReceiptApi(file);
      setScanResult(result);
      setStep("review");
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "ไม่สามารถสแกนใบเสร็จได้ กรุณาลองใหม่อีกครั้ง"
      );
      setStep("idle");
    }
  };

  // 2. Handle expense submission
  const handleSaveExpense = async (formData: CreateExpensePayload) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const created = await createExpenseApi({
        ...formData,
        created_by: activeUserName,
      });

      setSavedExpense(created);
      setSessionExpenses((prev) => [created, ...prev]);
      setStep("success");
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "บันทึกค่าใช้จ่ายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Reset for next upload
  const handleUploadNext = () => {
    setStep("idle");
    setScanResult(null);
    setLocalPreview("");
    setSavedExpense(null);
    setErrorMessage(null);
  };

  return (
    <LineLoginGate>
      <main className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-start p-4 sm:p-6 relative">
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto space-y-4">
          <AppHeader
            title="Chawy ERP · Expense"
            subtitle="สแกนและบันทึกใบเสร็จเข้าสู่ระบบ"
            icon={<Receipt className="w-5 h-5 text-white" />}
          />

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Step-by-Step Flow */}
          {step === "idle" && (
            <div className="space-y-4">
              <ImageDropzone onImageSelected={handleImageSelected} />
              <SessionHistory items={sessionExpenses} />
            </div>
          )}

          {step === "scanning" && (
            <ScanningState previewUrl={localPreview} />
          )}

          {step === "review" && scanResult && (
            <ReceiptReviewForm
              initialData={scanResult}
              localPreviewUrl={localPreview}
              userName={activeUserName}
              onSubmit={handleSaveExpense}
              onRetake={handleUploadNext}
              isSaving={isSaving}
            />
          )}

          {step === "success" && savedExpense && (
            <div className="space-y-4">
              <SuccessCard
                expense={savedExpense}
                onUploadNext={handleUploadNext}
              />
              <SessionHistory items={sessionExpenses} />
            </div>
          )}
        </div>
      </main>
    </LineLoginGate>
  );
}
