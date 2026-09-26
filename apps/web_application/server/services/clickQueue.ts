import { Queue, Worker } from "bullmq";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";

export const clickQueue = new Queue("click-tracking", { connection: redis });

declare global {
  var _clickWorker: Worker | undefined;
}

if (!globalThis._clickWorker) {
  globalThis._clickWorker = new Worker(
    "click-tracking",
    async (job) => {
      const { shortCode } = job.data;
      if (shortCode) {
        await connectToDatabase();
        await UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } });
      }
    },
    { 
      connection: redis,
      concurrency: 100, // Process up to 100 jobs concurrently without blocking the event loop
    }
  );

  globalThis._clickWorker.on("failed", (job, err) => {
    console.error(`[ClickWorker] Job ${job?.id} failed with error:`, err.message);
  });
}

export const trackClickAsync = async (shortCode: string) => {
  await clickQueue.add(
    "track-click",
    { shortCode },
    {
      removeOnComplete: true,
      removeOnFail: 1000,
    }
  );
};
