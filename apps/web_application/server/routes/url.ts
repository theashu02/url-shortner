import { Elysia, t } from "elysia";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { generateShortCode } from "@/server/lib/base62";

export const urlRoute = new Elysia({ prefix: "/url" }).post(
  "/create",
  async ({ body, request, set }) => {
    try {
      const { url } = body;
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      const rateLimitKey = `ratelimit:${ip}`;

      const requests = await redis.incr(rateLimitKey);
      if (requests === 1) await redis.expire(rateLimitKey, 60);
      
      if (requests > 100) {
        set.status = 429;
        return { message: "Rate limit exceeded (100 req/min)." };
      }

      await connectToDatabase();

      // Generate a unique 6-character short code
      let shortCode = "";
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateShortCode();
        const exists = await UrlModel.exists({ shortCode: candidate });
        if (!exists) {
          shortCode = candidate;
          break;
        }
      }

      if (!shortCode) {
        set.status = 500;
        return { message: "Failed to generate unique short code. Try again." };
      }

      await Promise.all([
        UrlModel.create({ shortCode, url }),
        redis.setex(`url:${shortCode}`, 7 * 24 * 60 * 60, url),
      ]);

      set.status = 201;
      return { shortCode, originalUrl: url };
      
    } catch (err) {
      console.error("Error creating short URL:", err);
      set.status = 500;
      return { message: "Internal server error" };
    }
  },
  {
    body: t.Object({
      url: t.String({ format: "uri", error: "Invalid URL format" }),
    }),
  }
);