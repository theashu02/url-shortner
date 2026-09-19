import { Elysia, t } from "elysia";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { generateShortCode } from "@/server/lib/base62";

const CUSTOM_SLUG_RE = /^[a-zA-Z0-9-]{3,50}$/;

export const urlRoute = new Elysia({ prefix: "/url" }).post(
  "/create",
  async ({ body, request, set }) => {
    try {
      const { url, customSlug } = body;
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      const rateLimitKey = `ratelimit:${ip}`;

      const requests = await redis.incr(rateLimitKey);
      if (requests === 1) await redis.expire(rateLimitKey, 60);

      if (requests > 100) {
        set.status = 429;
        return { message: "Rate limit exceeded (100 req/min)." };
      }

      let shortCode: string;

      if (customSlug) {
        if (!CUSTOM_SLUG_RE.test(customSlug)) {
          set.status = 400;
          return { message: "Custom alias must be 3–50 characters (letters, numbers, hyphens only)." };
        }

        const cachedTaken = await redis.get(`slug:taken:${customSlug}`).catch(() => null);
        if (cachedTaken) {
          set.status = 409;
          return { message: "This custom alias is already taken. Please choose another." };
        }

        await connectToDatabase();
        const existsInDb = await UrlModel.exists({ shortCode: customSlug });
        if (existsInDb) {
          redis.set(`slug:taken:${customSlug}`, "1").catch(() => {});
          set.status = 409;
          return { message: "This custom alias is already taken. Please choose another." };
        }
        shortCode = customSlug;

      } else {
        await connectToDatabase();
        shortCode = "";
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidate = generateShortCode();
          const exists = await UrlModel.exists({ shortCode: candidate });
          if (!exists) { shortCode = candidate; break; }
        }
        if (!shortCode) {
          set.status = 500;
          return { message: "Failed to generate unique short code. Try again." };
        }
      }

      await Promise.all([
        UrlModel.create({ shortCode, url }),
        redis.setex(`url:${shortCode}`, 7 * 24 * 60 * 60, url),
        redis.set(`slug:taken:${shortCode}`, "1"),
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
      customSlug: t.Optional(t.String()),
    }),
  }
);