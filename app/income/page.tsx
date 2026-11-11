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
  CreateIncomePayload,
  IncomeRecord,
  ScanResponse,
} from "@/lib/types";
import { scanIncomeSlipApi, createIncomeApi } from "@/lib/api";
import {
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type AppStep = "idle" | "scanning" | "review" | "success";

export default function IncomeUploadPage() {
  const { profile } = useLiff();

  // Flow State
  const [step, setStep] = useState<AppStep>("idle");
  const [localPreview, setLocalPreview] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [savedIncome, setSavedIncome] = useState<IncomeRecord | null>(null);
  const [sessionIncomes, setSessionIncomes] = useState<IncomeRecord[]>([]);

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
      const result = await scanIncomeSlipApi(file);
      setScanResult(result);
      setStep("review");
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "ไม่สามารถสแกนสลิปรายรับได้ กรุณาลองใหม่อีกครั้ง"
      );
      setStep("idle");
    }
  };

  // 2. Handle income submission
  const handleSaveIncome = async (formData: CreateIncomePayload) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const created = await createIncomeApi({
        ...formData,
        created_by: activeUserName,
      });

      setSavedIncome(created);
      setSessionIncomes((prev) => [created, ...prev]);
      setStep("success");
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "บันทึกรายรับไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
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
    setSavedIncome(null);
    setErrorMessage(null);
  };

  return (
    <LineLoginGate>
      <main className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-start p-4 sm:p-6 relative">
        {/* Main Container */}
        <div className="w-full max-w-md mx-auto space-y-4">
          <AppHeader
            title="Chawy ERP · Income"
            subtitle="สแกนและบันทึกสลิปรายรับเข้าสู่ระบบ"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
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
              <ImageDropzone kind="income" onImageSelected={handleImageSelected} />
              <SessionHistory kind="income" items={sessionIncomes} />
            </div>
          )}

          {step === "scanning" && (
            <ScanningState kind="income" previewUrl={localPreview} />
          )}

          {step === "review" && scanResult && (
            <ReceiptReviewForm
              kind="income"
              initialData={scanResult}
              localPreviewUrl={localPreview}
              userName={activeUserName}
              onSubmit={handleSaveIncome}
              onRetake={handleUploadNext}
              isSaving={isSaving}
            />
          )}

          {step === "success" && savedIncome && (
            <div className="space-y-4">
              <SuccessCard
                kind="income"
                expense={savedIncome}
                onUploadNext={handleUploadNext}
              />
              <SessionHistory kind="income" items={sessionIncomes} />
            </div>
          )}
        </div>
      </main>
    </LineLoginGate>
  );
}
