import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { calculateRedisTTL } from "@/server/lib/expiration";
import { NO_CACHE_HEADERS, resolveSafeUrl, SHORT_CODE_RE } from "@/lib/constant";

function trackClick(shortCode: string): void {
  connectToDatabase()
  .then(() => UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }))
  .catch((err) => console.error("[Redirection] Click tracking error:", err));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  if (!shortCode || !SHORT_CODE_RE.test(shortCode)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    let destinationUrl: string | null = null;
    try {
      destinationUrl = await redis.get(`url:${shortCode}`);
    } catch {
      console.log('Going to check URL for mongodb')
    }

    if (!destinationUrl) {
      await connectToDatabase();
      const urlDoc = await UrlModel.findOne({ shortCode }).lean();

      if (!urlDoc?.url) {
        return NextResponse.redirect(
          new URL("/?error=link_not_found", request.url)
        );
      }

      if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) <= new Date()) {
        return NextResponse.redirect(
          new URL("/?error=link_expired", request.url)
        );
      }

      destinationUrl = urlDoc.url;

      const redisTtl = calculateRedisTTL(urlDoc.expiresAt ? new Date(urlDoc.expiresAt).toISOString() : null);
      if (redisTtl > 0) {
        redis
          .setex(`url:${shortCode}`, redisTtl, destinationUrl)
          .catch(() => {});
      }
    }

    const finalUrl = resolveSafeUrl(destinationUrl);
    if (!finalUrl) {
      return NextResponse.redirect(
        new URL("/?error=invalid_link", request.url)
      );
    }

    trackClick(shortCode);

    return NextResponse.redirect(finalUrl, {
      status: 307,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[Redirection] Unhandled error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}