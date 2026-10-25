import crypto from "crypto";

/**
 * Validates the LINE webhook request signature.
 */
export function validateLineSignature(
  bodyString: string,
  channelSecret: string,
  signature: string | null
): boolean {
  if (!signature || !channelSecret) {
    return false;
  }

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(bodyString)
    .digest("base64");

  return hash === signature;
}
