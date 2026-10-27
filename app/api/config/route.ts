import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  let liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";

  // If not found in process.env or is placeholder, read from .env.example
  if (!liffId || liffId.includes("your-liff-id") || liffId.includes("XXXXXXXX")) {
    try {
      const examplePath = path.resolve(process.cwd(), ".env.example");
      if (fs.existsSync(examplePath)) {
        const lines = fs.readFileSync(examplePath, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("NEXT_PUBLIC_LIFF_ID=")) {
            const val = trimmed.replace("NEXT_PUBLIC_LIFF_ID=", "").trim();
            if (val && !val.includes("your-liff-id") && !val.includes("XXXXXXXX")) {
              liffId = val;
              break;
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return NextResponse.json({
    liffId: liffId || "",
  });
}
