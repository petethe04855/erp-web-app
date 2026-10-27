"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LineUserProfile } from "@/lib/types";

const DEV_USER_KEY = "erp_dev_line_profile";

interface LiffContextType {
  isLiffReady: boolean;
  isInLiff: boolean;
  isLoggedIn: boolean;
  profile: LineUserProfile | null;
  error: string | null;
  liffIdConfigured: boolean;
  login: () => void;
  logout: () => void;
  bypassLogin: (name?: string) => void;
}

const LiffContext = createContext<LiffContextType>({
  isLiffReady: false,
  isInLiff: false,
  isLoggedIn: false,
  profile: null,
  error: null,
  liffIdConfigured: false,
  login: () => {},
  logout: () => {},
  bypassLogin: () => {},
});

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isInLiff, setIsInLiff] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LineUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liffIdConfigured, setLiffIdConfigured] = useState(false);
  const [liffInstance, setLiffInstance] = useState<any>(null);

  const bypassLogin = useCallback((customName: string = "พีท") => {
    const devProfile: LineUserProfile = {
      userId: "U" + Math.random().toString(36).substring(2, 12).toUpperCase(),
      displayName: customName,
      statusMessage: "ERP Developer",
    };
    try {
      localStorage.setItem(DEV_USER_KEY, JSON.stringify(devProfile));
    } catch {
      // Ignore localStorage error
    }
    setProfile(devProfile);
    setIsLoggedIn(true);
    setIsLiffReady(true);
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check if dev bypass was previously used
    try {
      const savedDevProfile = localStorage.getItem(DEV_USER_KEY);
      if (savedDevProfile) {
        const parsed = JSON.parse(savedDevProfile);
        if (parsed?.userId && parsed?.displayName) {
          setProfile(parsed);
          setIsLoggedIn(true);
          setIsLiffReady(true);
          setLiffIdConfigured(true);
          return;
        }
      }
    } catch {
      // Ignore
    }

    const initLiff = async (id: string) => {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        if (!isMounted) return;
        setLiffInstance(liff);

        await liff.init({ liffId: id.trim() });
        if (!isMounted) return;

        const inClient = liff.isInClient();
        setIsInLiff(inClient);

        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          try {
            const lineProfile = await liff.getProfile();
            if (isMounted) {
              setProfile({
                userId: lineProfile.userId,
                displayName: lineProfile.displayName,
                pictureUrl: lineProfile.pictureUrl,
                statusMessage: lineProfile.statusMessage,
              });
            }
          } catch (profileErr: any) {
            console.warn("[LIFF] Could not get profile directly, attempting decoded ID token:", profileErr);
            const idToken = liff.getDecodedIDToken();
            if (isMounted && idToken) {
              setProfile({
                userId: idToken.sub || "U-LINE-USER",
                displayName: idToken.name || "LINE User",
                pictureUrl: idToken.picture,
              });
            } else if (isMounted) {
              setProfile({
                userId: "U-LINE-USER",
                displayName: "LINE User",
              });
            }
          }
        }

        if (isMounted) {
          setIsLiffReady(true);
        }
      } catch (err: any) {
        console.warn("[LIFF] Init error:", err);
        if (isMounted) {
          setError(err?.message || "LIFF initialization failed");
          setIsLiffReady(true);
        }
      }
    };

    const start = async () => {
      let resolvedId = process.env.NEXT_PUBLIC_LIFF_ID || "";
      const isPlaceholder =
        !resolvedId ||
        resolvedId.trim() === "" ||
        resolvedId.includes("your-liff-id") ||
        resolvedId.includes("XXXXXXXX");

      if (isPlaceholder) {
        try {
          const res = await fetch("/api/config");
          if (res.ok) {
            const data = await res.json();
            if (data?.liffId) {
              resolvedId = data.liffId;
            }
          }
        } catch (fetchErr) {
          console.warn("[LIFF] Could not fetch server config:", fetchErr);
        }
      }

      if (!isMounted) return;

      const valid = Boolean(
        resolvedId &&
          resolvedId.trim() !== "" &&
          !resolvedId.includes("your-liff-id") &&
          !resolvedId.includes("XXXXXXXX")
      );

      setLiffIdConfigured(valid);

      if (valid) {
        await initLiff(resolvedId);
      } else {
        setIsLiffReady(true);
      }
    };

    start();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(() => {
    if (liffInstance) {
      liffInstance.login();
    } else {
      import("@line/liff").then((m) => m.default.login());
    }
  }, [liffInstance]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(DEV_USER_KEY);
    } catch {
      // Ignore
    }
    if (liffInstance) {
      liffInstance.logout();
    }
    setIsLoggedIn(false);
    setProfile(null);
    window.location.reload();
  }, [liffInstance]);

  return (
    <LiffContext.Provider
      value={{
        isLiffReady,
        isInLiff,
        isLoggedIn,
        profile,
        error,
        liffIdConfigured,
        login,
        logout,
        bypassLogin,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
