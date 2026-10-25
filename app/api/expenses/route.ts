import { NextRequest, NextResponse } from "next/server";
import { getBackendAuthToken } from "@/lib/serverToken";

const ERP_API_URL =
  process.env.ERP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8084/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = await getBackendAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Call /finance/expenses directly with valid token, or fall back to /public/expenses
    let response = await fetch(`${ERP_API_URL}/finance/expenses`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok && (response.status === 404 || response.status === 401)) {
      response = await fetch(`${ERP_API_URL}/public/expenses`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[API /api/expenses] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error saving expense",
      },
      { status: 500 }
    );
  }
}
