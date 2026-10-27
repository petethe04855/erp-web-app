"use client";

import React from "react";
import { useLiff } from "./LiffProvider";
import { KeyRound, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

interface LineLoginGateProps {
  children: React.ReactNode;
}

export function LineLoginGate({ children }: LineLoginGateProps) {
  const { isLiffReady, isLoggedIn, profile, liffIdConfigured, login, bypassLogin, error } =
    useLiff();

  // 1. Initializing LIFF SDK / Checking Login
  if (!isLiffReady) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-4xl sm:text-5xl font-black text-[#00C300] tracking-wider mb-8 select-none">
          LINE
        </h1>
        <div className="w-8 h-8 border-3 border-[#00C300] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-400">
          กำลังตรวจสอบสถานะการเข้าสู่ระบบ LINE...
        </p>
      </div>
    );
  }

  // 2. LIFF ID is not yet configured
  if (!liffIdConfigured) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-neutral-800 text-center text-white">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            ยังไม่ได้กำหนดค่า LINE LIFF ID
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
            ระบบกำหนดให้ต้องเชื่อมต่อบัญชี LINE ก่อนใช้งาน กรุณาระบุ{" "}
            <code className="bg-neutral-800 text-amber-400 px-1.5 py-0.5 rounded font-mono text-xs">
              NEXT_PUBLIC_LIFF_ID
            </code>{" "}
            ในไฟล์ <code className="bg-neutral-800 px-1 py-0.5 rounded text-xs">.env</code> หรือ{" "}
            <code className="bg-neutral-800 px-1 py-0.5 rounded text-xs">.env.example</code>
          </p>
          <div className="bg-black/50 rounded-2xl p-4 text-left border border-neutral-800 mb-6 space-y-2">
            <p className="text-xs font-semibold text-neutral-300">ตัวอย่างการตั้งค่า:</p>
            <pre className="text-[11px] font-mono text-neutral-200 bg-neutral-900 p-2.5 rounded-lg overflow-x-auto">
              NEXT_PUBLIC_LIFF_ID=2012195196-DRdyjiyt
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is NOT logged in or profile is not yet available
  if (!isLoggedIn || !profile) {
    const isUrlMismatch = error && (error.includes("not under") || error.includes("URL"));

    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 select-none">
        <div className="max-w-xs w-full flex flex-col items-center text-center">
          {/* Green LINE Brand Logo Header */}
          <h1 className="text-5xl font-black text-[#00C300] tracking-wider mb-8">
            LINE
          </h1>

          {/* User Profile Avatar / Default LINE Icon */}
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-800 shadow-xl bg-[#222222] flex items-center justify-center">
              <svg
                className="w-14 h-14 fill-[#00C300]"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.085.922.26 1.057.595.122.302.08.774.039 1.08l-.17 1.026c-.052.312-.246 1.22.868.665 1.115-.555 6.012-3.541 8.204-6.063C22.81 15.08 24 12.825 24 10.304z" />
              </svg>
            </div>
          </div>

          {/* Subtext */}
          <p className="text-xs text-neutral-400 mb-1 font-normal">
            Continue as
          </p>
          <p className="text-base font-bold text-white mb-6">
            พีท
          </p>

          {/* Mismatch or LIFF error alert */}
          {error && (
            <div className="w-full mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs text-left leading-relaxed">
              <div className="flex items-center space-x-2 font-semibold mb-1 text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {isUrlMismatch ? "Endpoint URL ไม่ตรงกัน" : "ข้อผิดพลาด LINE"}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                {isUrlMismatch
                  ? "ใน LINE Developers Console ตั้ง Endpoint URL ไว้เป็น Cloudflare URL เก่า ไม่ตรงกับ localhost:8083"
                  : error}
              </p>
            </div>
          )}

          {/* Official Style Green Log in Button */}
          <button
            onClick={login}
            type="button"
            className="w-full py-3.5 px-6 rounded-lg bg-[#00C300] hover:bg-[#00b000] active:scale-[0.98] text-white font-bold text-base transition-all shadow-lg shadow-[#00C300]/20 mb-3 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Log in</span>
          </button>

          {/* Bypass Button for Localhost Development if error occurs */}
          <button
            onClick={() => bypassLogin("พีท")}
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 font-medium text-xs transition-all mb-4 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>เข้าสู่ระบบทันที (โหมดทดสอบ: พีท)</span>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
          </button>

          {/* Log in to another account link */}
          <button
            onClick={login}
            type="button"
            className="text-xs text-[#3b82f6] hover:text-[#60a5fa] hover:underline cursor-pointer transition-colors"
          >
            Log in to another account
          </button>
        </div>
      </div>
    );
  }

  // 4. Authenticated -> Render App
  return <>{children}</>;
}
