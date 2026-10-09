import { Queue, Worker } from "bullmq";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { ClickEventModel } from "@/server/models/clickEvent";
import {
  CachedGeoProvider,
  IpApiGeoProvider,
  EMPTY_GEO,
  buildClickEventDoc,
  type RawClickCapture,
  type EnrichedClickEvent,
} from "@/server/lib/click-capture";

const geoProvider = new CachedGeoProvider(new IpApiGeoProvider(), redis);

export const clickQueue = new Queue("click-tracking", { connection: redis });

declare global {
  var _clickWorker: Worker | undefined;
}

if (!globalThis._clickWorker) {
  console.log("[ClickWorker] Initializing background worker...");
  globalThis._clickWorker = new Worker(
    "click-tracking",
    async (job) => {
      const { shortCode, capture } = job.data as {
        shortCode: string;
        capture: RawClickCapture;
      };

      if (!shortCode) return;

      let geo = EMPTY_GEO;
      if (capture.geoFromHeaders) {
        geo = { ...EMPTY_GEO, ...capture.geoFromHeaders };
      } else if (capture.ipRaw) {
        geo = await geoProvider.lookup(capture.ipRaw);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ipRaw: _, geoFromHeaders: __, ...rest } = capture;
      const enriched: EnrichedClickEvent = { ...rest, geo };

      await connectToDatabase();

      await Promise.all([
        UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }),
        ClickEventModel.create(buildClickEventDoc(shortCode, enriched)),
      ]);

      console.log(`[ClickEvent] Fully Enriched Capture for ${shortCode}:`, JSON.stringify(enriched, null, 2));
    },
    {
      connection: redis,
      concurrency: 50,
    },
  );

  globalThis._clickWorker.on("failed", (job, err) => {
    console.error(`[ClickWorker] Job ${job?.id} failed:`, err.message);
  });
}

export async function trackClickAsync(
  shortCode: string,
  capture: RawClickCapture,
): Promise<void> {
  console.log(`[ClickQueue] Adding job for ${shortCode}...`);
  await clickQueue.add(
    "track-click",
    { shortCode, capture },
    {
      removeOnComplete: true,
      removeOnFail: 1000,
    },
  );
}
