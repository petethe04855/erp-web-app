"use client";

import React from "react";
import { useLiff } from "@/components/LiffProvider";
import { LogOut } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export function AppHeader({ title, subtitle, icon }: AppHeaderProps) {
  const { profile, logout } = useLiff();

  return (
    <header className="flex items-center justify-between pb-3 border-b border-neutral-200">
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
              {title}
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[11px] text-neutral-500">{subtitle}</p>
        </div>
      </div>

      {/* Authenticated LINE User Badge */}
      <div className="flex items-center space-x-1.5">
        <div className="flex items-center space-x-2 bg-white border border-neutral-200/90 rounded-full pl-1 pr-3 py-1 shadow-sm">
          {profile?.pictureUrl ? (
            <img
              src={profile.pictureUrl}
              alt={profile.displayName}
              className="w-6 h-6 rounded-full object-cover border border-emerald-500"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#06C755] flex items-center justify-center text-white text-[11px] font-bold">
              L
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-neutral-800 max-w-[100px] truncate leading-tight">
              {profile?.displayName}
            </span>
            <span className="text-[9px] text-emerald-600 font-mono font-medium max-w-[100px] truncate">
              {profile?.userId}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          title="ออกจากระบบ LINE"
          type="button"
          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-200/50 rounded-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
