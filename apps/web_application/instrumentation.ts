import { connectToDatabase } from "@/server/db/mongoose";
import { redis } from "@/server/redis/redis";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  console.log("🚀 [Next.js] Server starting... Verifying connections.");

  const results = await Promise.allSettled([
    connectToDatabase(),
    redis.ping(),
  ]);

  const [mongoResult, redisResult] = results;

  if (mongoResult.status === "fulfilled") {
    console.log("✅ [MongoDB] Connected successfully!");
  } else {
    console.error("❌ [MongoDB] Connection failed:", mongoResult.reason);
  }

  if (redisResult.status === "fulfilled") {
    console.log("✅ [Redis] Connected successfully!");
  } else {
    console.error("❌ [Redis] Connection failed:", redisResult.reason);
  }
}