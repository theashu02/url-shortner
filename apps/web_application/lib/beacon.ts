export interface BeaconOptions {
  keepalive?: boolean;
  timeoutMs?: number;
}

// Fire-and-forget analytics POST. Never throws and never breaks the visitor flow.
export function sendBeacon(
  path: string,
  payload: unknown,
  options?: BeaconOptions
): Promise<void> {
  try {
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    if (options?.keepalive) init.keepalive = true;
    if (options?.timeoutMs) init.signal = AbortSignal.timeout(options.timeoutMs);
    return fetch(path, init).then(
      () => undefined,
      () => undefined
    );
  } catch {
    return Promise.resolve();
  }
}
