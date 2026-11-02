import { container } from "@/server/core/container";

// Ensure the background enrichment worker runs even when only this
// legacy module is imported (e.g. the redirect route). Idempotent.
container.startWorkers();

/** Backward-compatible facade over ClickTrackingQueue (OOP). */
export const clickQueue = container.clickQueue.innerQueue;
export const trackClickAsync = (
  ...args: Parameters<typeof container.clickQueue.trackClick>
): Promise<void> => container.clickQueue.trackClick(...args).then(() => undefined);
