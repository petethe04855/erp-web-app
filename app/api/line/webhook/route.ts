import { NextRequest, NextResponse } from "next/server";
import { validateLineSignature } from "@/lib/line/verifySignature";
import {
  downloadLineContent,
  getLineUserProfile,
  replyLineMessage,
} from "@/lib/line/client";
import {
  buildExpenseSavedFlex,
  buildReceiptReviewFlex,
} from "@/lib/line/flexMessage";
import { ScanResponse } from "@/lib/types";
import { getBackendAuthToken } from "@/lib/serverToken";

const ERP_API_URL =
  process.env.ERP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8084/api/v1";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature");
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    // In production or when LINE_CHANNEL_SECRET is configured, enforce signature check
    if (channelSecret && !validateLineSignature(rawBody, channelSecret, signature)) {
      console.warn("[LINE Webhook] Invalid signature rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let bodyData: any;
    try {
      bodyData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const events = bodyData?.events || [];
    for (const event of events) {
      // 1. Handle incoming Receipt Image message
      if (event.type === "message" && event.message?.type === "image") {
        await handleImageMessage(event);
      }

      // 2. Handle 1-Click Confirmation Postback
      if (event.type === "postback") {
        await handlePostback(event);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[LINE Webhook Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles image message sent in LINE chat.
 */
async function handleImageMessage(event: any) {
  const messageId = event.message.id;
  const replyToken = event.replyToken;

  try {
    // 1. Download image content from LINE servers
    const imageBuffer = await downloadLineContent(messageId);

    // 2. Forward to erp-api-v2 Gemini OCR Scanner
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });
    formData.append("image", blob, `line-${messageId}.jpg`);

    const token = await getBackendAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let scanRes = await fetch(`${ERP_API_URL}/finance/expenses/scan-receipt`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!scanRes.ok && (scanRes.status === 404 || scanRes.status === 401)) {
      const retryFormData = new FormData();
      retryFormData.append("image", blob, `line-${messageId}.jpg`);
      scanRes = await fetch(`${ERP_API_URL}/public/expenses/scan-receipt`, {
        method: "POST",
        headers,
        body: retryFormData,
      });
    }

    if (!scanRes.ok) {
      const errText = await scanRes.text();
      throw new Error(`AI Scan failed: ${errText}`);
    }

    const scanJson = await scanRes.json();
    const data: ScanResponse = scanJson.data;

    // 3. Build LIFF URL if configured
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffUrl = liffId ? `https://liff.line.me/${liffId}` : undefined;

    // 4. Send interactive review Flex Message back to user
    const flex = buildReceiptReviewFlex(data, data.slip_url, liffUrl);
    await replyLineMessage(replyToken, [flex]);
  } catch (err: any) {
    console.error("[LINE handleImageMessage] Error:", err);
    await replyLineMessage(replyToken, [
      {
        type: "text",
        text: `⚠️ ไม่สามารถวิเคราะห์สลิปได้: ${err?.message || "ระบบขัดข้อง"}`,
      },
    ]);
  }
}

/**
 * Handles postback actions (e.g. 1-click confirm save from Flex Message).
 */
async function handlePostback(event: any) {
  const replyToken = event.replyToken;
  let payload: any;

  try {
    payload = JSON.parse(event.postback?.data || "{}");
  } catch {
    return;
  }

  if (payload.action === "confirm_expense") {
    try {
      // Get sender user's LINE profile
      const userId = event.source?.userId;
      let userName = "LINE User";
      if (userId) {
        const profile = await getLineUserProfile(userId);
        if (profile?.displayName) {
          userName = profile.displayName;
        }
      }

      const token = await getBackendAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const bodyData = {
        date: payload.date || new Date().toISOString().split("T")[0],
        category: payload.category || "ค่าใช้จ่ายในการบริหาร",
        channel: "LINE",
        amount: Number(payload.amount || 0),
        product_name: payload.product_name || "-",
        slip_url: payload.slip_url || "",
        vendor: payload.vendor || "",
        invoice_ref: payload.invoice_ref || "",
        description: payload.description || "",
        created_by: `LINE: ${userName}`,
      };

      // Submit to erp-api-v2
      let createRes = await fetch(`${ERP_API_URL}/finance/expenses`, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyData),
      });

      if (!createRes.ok && (createRes.status === 404 || createRes.status === 401)) {
        createRes = await fetch(`${ERP_API_URL}/public/expenses`, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyData),
        });
      }

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(errText);
      }

      const createJson = await createRes.json();
      const expense = createJson.data;

      // Send confirmation Flex Message
      const successFlex = buildExpenseSavedFlex(
        expense.code || `#EXP-${expense.id}`,
        expense.amount,
        expense.category,
        expense.vendor
      );
      await replyLineMessage(replyToken, [successFlex]);
    } catch (err: any) {
      console.error("[LINE handlePostback] Save Error:", err);
      await replyLineMessage(replyToken, [
        {
          type: "text",
          text: `❌ บันทึกค่าใช้จ่ายไม่สำเร็จ: ${err?.message || "โปรดลองใหม่อีกครั้ง"}`,
        },
      ]);
    }
  }
}
