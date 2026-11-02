import { Queue, Worker } from "bullmq";
import type Redis from "ioredis";
import { UrlModel } from "@/server/models/url";
import { ClickEventModel } from "@/server/models/clickEvent";
import {
  EMPTY_GEO,
  buildClickEventDoc,
  type RawClickCapture,
  type EnrichedClickEvent,
} from "@/server/lib/click-capture";
import type { IDatabase } from "@/server/core/database";
import type { IGeoProvider } from "@/server/modules/device/geo";

/**
 * SRP: background click-enrichment pipeline (BullMQ).
 * DIP: Redis connection + database + geo behind seams; OCP: swap providers.
 *
 * Scaling notes:
 * - The worker runs on a dedicated duplicated Redis connection so its
 *   blocking calls can never stall the shared client serving redirects.
 * - Concurrency is bounded (20) so one instance holds at most ~40 Mongo
 *   operations in flight; scale out with more instances, not threads.
 * - Jobs retry with exponential backoff and retained failures are capped,
 *   so a poisoned job cannot grow Redis memory without bound.
 */
export class ClickTrackingQueue {
  private readonly queue: Queue;
  private readonly workerConnection: Redis;
  private worker: Worker | undefined;

  constructor(
    private readonly redis: Redis,
    private readonly db: IDatabase,
    private readonly geo: IGeoProvider,
  ) {
    this.queue = new Queue("click-tracking", { connection: this.redis });
    this.workerConnection = this.redis.duplicate();
    this.workerConnection.on("error", (err: Error) => {
      console.error("[ClickWorker] redis error:", err.message);
    });
  }

  /** Starts the (process-wide) worker. Safe to call once via the container. */
  startWorker(): void {
    if (this.worker) return;
    console.log("[ClickWorker] Initializing background worker...");
    this.worker = new Worker(
      "click-tracking",
      async (job) => {
        const { shortCode, capture } = job.data as { shortCode: string; capture: RawClickCapture };
        if (!shortCode) return;

        let geo = EMPTY_GEO;
        if (capture.geoFromHeaders) {
          geo = { ...EMPTY_GEO, ...capture.geoFromHeaders };
        } else if (capture.ipRaw) {
          geo = await this.geo.lookup(capture.ipRaw);
        }

        const { ipRaw: _droppedIp, geoFromHeaders: _droppedHeaders, ...rest } = capture;
        void _droppedIp;
        void _droppedHeaders;
        const enriched: EnrichedClickEvent = { ...rest, geo };

        await this.db.connect();
        await Promise.all([
          UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }),
          ClickEventModel.create(buildClickEventDoc(shortCode, enriched)),
        ]);
      },
      { connection: this.workerConnection, concurrency: 20 },
    );

    this.worker.on("failed", (job, err) => {
      console.error(`[ClickWorker] Job ${job?.id} failed:`, err.message);
    });
  }

  trackClick(shortCode: string, capture: RawClickCapture): Promise<unknown> {
    return this.queue.add(
      "track-click",
      { shortCode, capture },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  get innerQueue(): Queue {
    return this.queue;
  }
}
