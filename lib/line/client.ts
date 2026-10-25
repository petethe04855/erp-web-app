/**
 * LINE Messaging API helper.
 */
export async function replyLineMessage(
  replyToken: string,
  messages: any[],
  channelAccessToken?: string
) {
  const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn("[LINE] LINE_CHANNEL_ACCESS_TOKEN is not configured");
    return;
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[LINE] reply failed:", response.status, errorText);
    throw new Error(`LINE API error: ${errorText}`);
  }
}

/**
 * Downloads binary image buffer from LINE content server.
 */
export async function downloadLineContent(
  messageId: string,
  channelAccessToken?: string
): Promise<Buffer> {
  const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to download LINE content: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Gets user profile from LINE API.
 */
export async function getLineUserProfile(
  userId: string,
  channelAccessToken?: string
): Promise<{ displayName: string; pictureUrl?: string } | null> {
  const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[LINE] Failed to fetch profile for user:", userId, err);
  }
  return null;
}
