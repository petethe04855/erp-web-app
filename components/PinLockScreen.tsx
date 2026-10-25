"use client";

import React, { useState, useEffect } from "react";
import { Lock, Delete, ShieldCheck, Sparkles } from "lucide-react";

interface PinLockScreenProps {
  onUnlock: () => void;
  defaultPin?: string;
}

export function PinLockScreen({ onUnlock, defaultPin = "1234" }: PinLockScreenProps) {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [remember, setRemember] = useState(true);

  const targetPin = process.env.NEXT_PUBLIC_DEFAULT_PIN || defaultPin;

  // Check if previously unlocked and remembered
  useEffect(() => {
    const savedPinAuth = localStorage.getItem("expense_app_unlocked");
    if (savedPinAuth === "true") {
      onUnlock();
    }
  }, [onUnlock]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setIsError(false);

      if (nextPin.length === 4) {
        if (nextPin === targetPin) {
          if (remember) {
            localStorage.setItem("expense_app_unlocked", "true");
          }
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setIsError(true);
          setTimeout(() => {
            setPin("");
            setIsError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleClear = () => {
    setPin("");
    setIsError(false);
  };

  // Keyboard support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        {/* App Logo & Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            ระบบอัปโหลดใบเสร็จ
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Chawy ERP Expense Uploader
          </p>
          <div className="text-xs text-neutral-600 font-medium mt-2.5 bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1 inline-block">
            ใส่รหัส PIN 4 หลัก (ค่าเริ่มต้น: {targetPin})
          </div>
        </div>

        {/* PIN Indicators */}
        <div
          className={`flex items-center justify-center space-x-3.5 py-1 transition-transform duration-200 ${
            isError ? "animate-bounce" : ""
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isError
                    ? "bg-red-500 scale-110 shadow-sm shadow-red-500/40"
                    : isFilled
                    ? "bg-neutral-900 scale-125"
                    : "bg-neutral-200 border border-neutral-300"
                }`}
              />
            );
          })}
        </div>

        {isError && (
          <p className="text-xs text-red-600 font-semibold animate-pulse">
            รหัส PIN ไม่ถูกต้อง โปรดลองอีกครั้ง
          </p>
        )}

        {/* Keypad */}
        <div className="w-full max-w-[260px] grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-200 active:scale-95 text-lg font-semibold text-neutral-900 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl hover:bg-neutral-100 active:scale-95 text-xs font-medium text-neutral-500 transition-all"
          >
            ล้าง
          </button>

          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-14 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-200 active:scale-95 text-lg font-semibold text-neutral-900 transition-all shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-xl hover:bg-neutral-100 active:scale-95 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Remember device checkbox */}
        <label className="flex items-center space-x-2 text-xs text-neutral-500 cursor-pointer pt-1 hover:text-neutral-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-neutral-900 bg-neutral-100 border-neutral-300 focus:ring-neutral-900"
          />
          <span>จดจำรหัส PIN บนอุปกรณ์นี้</span>
        </label>
      </div>
    </div>
  );
}
