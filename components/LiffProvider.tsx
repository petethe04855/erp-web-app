"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LineUserProfile } from "@/lib/types";

interface LiffContextType {
  isLiffReady: boolean;
  isInLiff: boolean;
  profile: LineUserProfile | null;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  isLiffReady: false,
  isInLiff: false,
  profile: null,
  error: null,
});

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isInLiff, setIsInLiff] = useState(false);
  const [profile, setProfile] = useState<LineUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      // LIFF not configured - standalone web mode
      setIsLiffReady(true);
      return;
    }

    import("@line/liff")
      .then((liffModule) => {
        const liff = liffModule.default;
        liff
          .init({ liffId })
          .then(async () => {
            setIsLiffReady(true);
            const inClient = liff.isInClient();
            setIsInLiff(inClient);

            if (liff.isLoggedIn()) {
              try {
                const lineProfile = await liff.getProfile();
                setProfile({
                  userId: lineProfile.userId,
                  displayName: lineProfile.displayName,
                  pictureUrl: lineProfile.pictureUrl,
                  statusMessage: lineProfile.statusMessage,
                });
              } catch (profileErr: any) {
                console.warn("[LIFF] Could not get profile:", profileErr);
              }
            } else if (inClient) {
              liff.login();
            }
          })
          .catch((err) => {
            console.warn("[LIFF] Init warning (fallback to web mode):", err);
            setError(err?.message || "LIFF initialization failed");
            setIsLiffReady(true);
          });
      })
      .catch((err) => {
        console.warn("[LIFF] Failed to load module:", err);
        setIsLiffReady(true);
      });
  }, []);

  return (
    <LiffContext.Provider value={{ isLiffReady, isInLiff, profile, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
