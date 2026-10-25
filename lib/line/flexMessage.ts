import { ScanResponse } from "../types";

/**
 * Builds an interactive LINE Flex Message for scanned expense receipt.
 */
export function buildReceiptReviewFlex(
  data: ScanResponse,
  rawImageUrl: string,
  liffUrl?: string
) {
  const formattedAmount = Number(data.amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Postback data encoded for 1-click confirmation
  const postbackPayload = JSON.stringify({
    action: "confirm_expense",
    amount: data.amount,
    date: data.date,
    category: data.category,
    channel: "LINE",
    product_name: data.product_name,
    vendor: data.vendor,
    invoice_ref: data.invoice_ref,
    description: data.description,
    slip_url: data.slip_url,
  });

  return {
    type: "flex" as const,
    altText: `🧾 สแกนใบเสร็จ: ฿${formattedAmount} (${data.vendor || "บันทึกค่าใช้จ่าย"})`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#064E3B",
        paddingAll: "20px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "✨ AI RECEIPT SCANNER",
                color: "#34D399",
                weight: "bold",
                size: "xs",
                letterSpacing: "1px",
              },
              {
                type: "text",
                text: data.date || "วันนี้",
                color: "#A7F3D0",
                size: "xs",
                align: "end",
              },
            ],
          },
          {
            type: "text",
            text: `฿${formattedAmount}`,
            color: "#FFFFFF",
            size: "3xl",
            weight: "bold",
            margin: "md",
          },
          {
            type: "text",
            text: data.vendor ? `ร้านค้า: ${data.vendor}` : "ค่าใช้จ่ายทั่วไป",
            color: "#E2E8F0",
            size: "sm",
            weight: "bold",
            margin: "xs",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "20px",
        contents: [
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "หมวดหมู่",
                    color: "#64748B",
                    size: "xs",
                    flex: 2,
                  },
                  {
                    type: "text",
                    text: data.category || "ค่าใช้จ่ายในการบริหาร",
                    color: "#0F172A",
                    size: "xs",
                    weight: "bold",
                    flex: 4,
                    align: "end",
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "รายการสินค้า",
                    color: "#64748B",
                    size: "xs",
                    flex: 2,
                  },
                  {
                    type: "text",
                    text: data.product_name || "-",
                    color: "#0F172A",
                    size: "xs",
                    flex: 4,
                    align: "end",
                    wrap: true,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "เลขที่อ้างอิง",
                    color: "#64748B",
                    size: "xs",
                    flex: 2,
                  },
                  {
                    type: "text",
                    text: data.invoice_ref || "-",
                    color: "#0F172A",
                    size: "xs",
                    flex: 4,
                    align: "end",
                  },
                ],
              },
            ],
          },
          ...(data.description
            ? [
                {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: "#F8FAFC",
                  cornerRadius: "8px",
                  paddingAll: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "รายละเอียด:",
                      color: "#475569",
                      size: "xxs",
                      weight: "bold",
                    },
                    {
                      type: "text",
                      text: data.description,
                      color: "#334155",
                      size: "xxs",
                      wrap: true,
                      margin: "xs",
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#059669",
            action: {
              type: "postback",
              label: "✅ ยืนยันบันทึกทันที",
              data: postbackPayload,
              displayText: `ยืนยันบันทึกค่าใช้จ่าย ฿${formattedAmount}`,
            },
          },
          ...(liffUrl
            ? [
                {
                  type: "button",
                  style: "secondary",
                  action: {
                    type: "uri",
                    label: "✏️ ตรวจสอบหรือแก้ไขในเว็บ",
                    uri: liffUrl,
                  },
                },
              ]
            : []),
        ],
      },
    },
  };
}

/**
 * Builds confirmation success Flex Message after saving to ERP expenses table.
 */
export function buildExpenseSavedFlex(
  code: string,
  amount: number,
  category: string,
  vendor: string
) {
  const formattedAmount = Number(amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    type: "flex" as const,
    altText: `✅ บันทึกค่าใช้จ่ายสำเร็จ: ฿${formattedAmount} (${code})`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#059669",
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: "✅ บันทึกค่าใช้จ่ายเรียบร้อย",
            color: "#FFFFFF",
            weight: "bold",
            size: "md",
          },
          {
            type: "text",
            text: `รหัสเอกสาร: ${code}`,
            color: "#D1FAE5",
            size: "xs",
            margin: "xs",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ยอดเงิน", color: "#64748B", size: "sm" },
              {
                type: "text",
                text: `฿${formattedAmount}`,
                color: "#0F172A",
                weight: "bold",
                size: "lg",
                align: "end",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "หมวดหมู่", color: "#64748B", size: "xs" },
              {
                type: "text",
                text: category,
                color: "#334155",
                size: "xs",
                align: "end",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ร้านค้า", color: "#64748B", size: "xs" },
              {
                type: "text",
                text: vendor || "-",
                color: "#334155",
                size: "xs",
                align: "end",
              },
            ],
          },
        ],
      },
    },
  };
}
