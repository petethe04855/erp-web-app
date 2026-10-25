let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Retrieves a valid Bearer token for server-to-server calls to erp-api-v2.
 * Caches token in memory to avoid redundant logins.
 */
export async function getBackendAuthToken(): Promise<string> {
  if (process.env.ERP_API_TOKEN) {
    return process.env.ERP_API_TOKEN;
  }

  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  const ERP_API_URL =
    process.env.ERP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8084/api/v1";

  try {
    const res = await fetch(`${ERP_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ERP_ADMIN_EMAIL || "admin@example.com",
        password: process.env.ERP_ADMIN_PASSWORD || "admin123",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.token) {
        cachedToken = data.data.token;
        tokenExpiresAt = now + 12 * 60 * 60 * 1000; // cache for 12 hours
        return cachedToken || "";
      }
    }
  } catch (err) {
    console.warn("[getBackendAuthToken] Auto-login fallback error:", err);
  }

  return "";
}
