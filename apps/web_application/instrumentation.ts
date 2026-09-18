import { connectToDatabase } from "@/server/db/mongoose";
import { redis } from "@/server/redis/redis";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🚀 [Next.js] Server starting... Verifying connections.");

    const results = await Promise.allSettled([
      connectToDatabase(),
      redis.ping() 
    ]);

    const [mongoResult, redisResult] = results;

    if (mongoResult.status === "rejected") {
      console.error("❌ [MongoDB] Connection failed:", mongoResult.reason);
    }

    if (redisResult.status === "rejected") {
      console.error("❌ [Redis] Connection failed:", redisResult.reason);
    }
  }
}