export function extractApiMessage(res: unknown, fallback: string): string {
  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: unknown }).data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }
  return fallback;
}
