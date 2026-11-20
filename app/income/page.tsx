"use client";

import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { LineLoginGate } from "@/components/LineLoginGate";
import { UploadFlow } from "@/components/UploadFlow";
import { useLiff } from "@/components/LiffProvider";
import { scanIncomeSlipApi, createIncomeApi } from "@/lib/api";
import { TrendingUp } from "lucide-react";

export default function IncomeUploadPage() {
  const { profile } = useLiff();

  const activeUserName = profile
    ? `${profile.displayName} (LINE ID: ${profile.userId})`
    : "พนักงาน";

  return (
    <LineLoginGate>
      <main className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-start p-4 sm:p-6 relative">
        <div className="w-full max-w-md mx-auto space-y-4">
          <AppHeader
            title="Chawy ERP · Income"
            subtitle="สแกนและบันทึกสลิปรายรับเข้าสู่ระบบ"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
          />
          <UploadFlow
            kind="income"
            userName={activeUserName}
            scanFn={scanIncomeSlipApi}
            createFn={createIncomeApi}
          />
        </div>
      </main>
    </LineLoginGate>
  );
}
