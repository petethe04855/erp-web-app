"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/components/LiffProvider";

// The middle selection page has been removed.
// Page selection is handled by LINE menu (LIFF endpoints) instead:
//   /expense -> ลงค่าใช้จ่าย
//   /income  -> ลงรายรับ
// Root simply defaults to the expense flow.
//
// IMPORTANT: this must NOT be a server-side redirect. When the LIFF endpoint URL
// is the site root, LINE login returns here with `?code=&state=&liffClientId=`
// (and LINE opens `?liff.state=/expense` for deep links). A server redirect
// drops that query string before liff.init() can read it, so the user is never
// logged in and gets sent back to LINE login forever. We wait for liff.init()
// (run by LiffProvider in the root layout) to finish, then navigate client-side.
export default function HomePage() {
  const router = useRouter();
  const { isLiffReady } = useLiff();

  useEffect(() => {
    if (!isLiffReady) return;
    // Rich menu deep links (https://liff.line.me/<id>/income) arrive here as
    // `/?liff.state=/income`. liff.init() normally redirects by itself and never
    // resolves, but when it is skipped (dev bypass profile in localStorage) or
    // fails, we must honour liff.state ourselves instead of forcing /expense.
    const state = new URLSearchParams(window.location.search).get("liff.state");
    const target =
      state && state.startsWith("/") && !state.startsWith("//") ? state : "/expense";
    router.replace(target);
  }, [isLiffReady, router]);

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 text-white">
      <div className="w-8 h-8 border-3 border-[#00C300] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
