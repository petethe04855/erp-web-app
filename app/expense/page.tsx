"use client";

import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { LineLoginGate } from "@/components/LineLoginGate";
import { UploadFlow } from "@/components/UploadFlow";
import { useLiff } from "@/components/LiffProvider";
import { scanReceiptApi, createExpenseApi } from "@/lib/api";
import { Receipt } from "lucide-react";

export default function ExpenseUploadPage() {
  const { profile } = useLiff();

  const activeUserName = profile
    ? `${profile.displayName} (LINE ID: ${profile.userId})`
    : "พนักงาน";

  return (
    <LineLoginGate>
      <main className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-start p-4 sm:p-6 relative">
        <div className="w-full max-w-md mx-auto space-y-4">
          <AppHeader
            title="Chawy ERP · Expense"
            subtitle="สแกนและบันทึกใบเสร็จเข้าสู่ระบบ"
            icon={<Receipt className="w-5 h-5 text-white" />}
          />
          <UploadFlow
            kind="expense"
            userName={activeUserName}
            scanFn={scanReceiptApi}
            createFn={createExpenseApi}
          />
        </div>
      </main>
    </LineLoginGate>
  );
}
