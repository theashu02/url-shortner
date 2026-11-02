import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { calculateRedisTTL } from "@/server/lib/expiration";
import {
  NO_CACHE_HEADERS,
  resolveSafeUrl,
  SHORT_CODE_RE,
  getRequestBaseUrl,
} from "@/lib/constant";
import { trackClickAsync } from "@/server/services/clickQueue";
import { captureVisitor } from "@/server/lib/click-capture";

const CAPTURE_CONFIG = {
  ip: { behindCloudflare: false, trustedProxyCount: 0 },
  hashSalt: process.env.IP_HASH_SALT ?? "default-dev-salt-change-in-prod",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;
  const baseUrl = getRequestBaseUrl(request.headers, request.nextUrl.origin);

  if (!shortCode || !SHORT_CODE_RE.test(shortCode)) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  try {
    let destinationUrl: string | null = null;
    let deviceCapture = false;
    try {
      const [cachedUrl, cachedDc] = await redis.mget(
        `url:${shortCode}`,
        `dc:${shortCode}`,
      );
      destinationUrl = cachedUrl;
      deviceCapture = cachedDc === "1";
    } catch {
      console.log("Going to check URL for mongodb");
    }

    if (!destinationUrl) {
      await connectToDatabase();
      const urlDoc = await UrlModel.findOne({ shortCode }).lean();

      if (!urlDoc?.url) {
        return NextResponse.redirect(
          new URL("/link-error?type=link_not_found", baseUrl),
        );
      }

      if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) <= new Date()) {
        return NextResponse.redirect(
          new URL("/link-error?type=link_expired", baseUrl),
        );
      }

      destinationUrl = urlDoc.url;
      deviceCapture = urlDoc.deviceCapture === true;

      const redisTtl = calculateRedisTTL(
        urlDoc.expiresAt ? new Date(urlDoc.expiresAt).toISOString() : null,
      );
      if (redisTtl > 0) {
        redis
          .setex(`url:${shortCode}`, redisTtl, destinationUrl)
          .catch(() => {});
        redis
          .setex(`dc:${shortCode}`, redisTtl, deviceCapture ? "1" : "0")
          .catch(() => {});
      }
    }

    const finalUrl = resolveSafeUrl(destinationUrl);
    if (!finalUrl) {
      return NextResponse.redirect(
        new URL("/?error=invalid_link", baseUrl),
      );
    }

    if (deviceCapture) {
      const interstitialUrl = new URL(
        `/go/${shortCode}${request.nextUrl.search}`,
        baseUrl,
      );
      return NextResponse.redirect(interstitialUrl, {
        status: 307,
        headers: NO_CACHE_HEADERS,
      });
    }

    const capture = captureVisitor(
      request.headers,
      request.nextUrl,
      destinationUrl,
      CAPTURE_CONFIG,
    );

    void trackClickAsync(shortCode, capture).catch((error) => {
      console.error("[ClickQueue]", error);
    });

    return NextResponse.redirect(finalUrl, {
      status: 307,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[Redirection] Unhandled error:", error);
    return NextResponse.redirect(new URL("/", baseUrl));
  }
}
