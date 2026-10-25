import { NextRequest, NextResponse } from "next/server";
import { getBackendAuthToken } from "@/lib/serverToken";

const ERP_API_URL =
  process.env.ERP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8084/api/v1";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file =
      formData.get("image") || formData.get("slip") || formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, message: "กรุณาแนบไฟล์รูปภาพสลิปหรือใบเสร็จ" },
        { status: 400 }
      );
    }

    const token = await getBackendAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const forwardFormData = new FormData();
    forwardFormData.append("image", file);

    // Call /finance/expenses/scan-receipt with token, or fall back to /public/expenses/scan-receipt
    let response = await fetch(`${ERP_API_URL}/finance/expenses/scan-receipt`, {
      method: "POST",
      headers,
      body: forwardFormData,
    });

    if (!response.ok && (response.status === 404 || response.status === 401)) {
      const retryFormData = new FormData();
      retryFormData.append("image", file);
      response = await fetch(`${ERP_API_URL}/public/expenses/scan-receipt`, {
        method: "POST",
        headers,
        body: retryFormData,
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[API /api/scan] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during scanning",
      },
      { status: 500 }
    );
  }
}
