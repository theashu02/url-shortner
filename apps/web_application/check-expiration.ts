import { connectToDatabase } from "./server/db/mongoose";
import { UrlModel } from "./server/models/url";
import { redis } from "./server/redis/redis";

async function check() {
  await connectToDatabase();
  const urls = await UrlModel.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log("Most recent URLs in DB:");
  for (const u of urls) {
    console.log(`- ${u.shortCode} | expiresAt: ${u.expiresAt} | url: ${u.url}`);
    const ttl = await redis.ttl(`url:${u.shortCode}`);
    console.log(`  Redis TTL for url:${u.shortCode} = ${ttl}`);
  }
  process.exit(0);
}

check().catch(console.error);
