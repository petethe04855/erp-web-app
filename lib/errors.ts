/** Best user-facing message from an axios/API error. */
export function errorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
}
