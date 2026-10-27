import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Support reading NEXT_PUBLIC_LIFF_ID from .env.example if .env/.env.local not created yet
let fallbackLiffId = "";
try {
  const examplePath = path.resolve(process.cwd(), ".env.example");
  if (fs.existsSync(examplePath)) {
    const lines = fs.readFileSync(examplePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("NEXT_PUBLIC_LIFF_ID=")) {
        const val = trimmed.replace("NEXT_PUBLIC_LIFF_ID=", "").trim();
        if (val && !val.includes("your-liff-id") && !val.includes("your_liff_id")) {
          fallbackLiffId = val;
        }
      }
    }
  }
} catch {
  // Ignore filesystem errors
}

const activeLiffId = process.env.NEXT_PUBLIC_LIFF_ID || fallbackLiffId;
if (activeLiffId && !process.env.NEXT_PUBLIC_LIFF_ID) {
  process.env.NEXT_PUBLIC_LIFF_ID = activeLiffId;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LIFF_ID: activeLiffId,
  },
  allowedDevOrigins: [
    "pages-dsl-limits-additional.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  async rewrites() {
    const expenseApiUrl =
      process.env.INTERNAL_EXPENSE_API_URL || "http://127.0.0.1:8085/api/v1";
    return [
      {
        source: "/api/expense/:path*",
        destination: `${expenseApiUrl}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:8085/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8085",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8085",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8084",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8084",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "sprofile.line-scdn.net",
      },
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
      },
    ],
  },
};

export default nextConfig;
