import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { createInterstitialClickEvent } from "@/server/services/deviceCapture";
import { SHORT_CODE_RE, resolveSafeUrl } from "@/lib/constant";
import { DeviceInterstitial } from "@/components/LandingPage/device-interstitial";

export const metadata: Metadata = {
  title: "Link Preview",
  robots: { index: false, follow: false },
};

export default async function DeviceInterstitialPage({
  params,
  searchParams,
}: {
  params: Promise<{ shortCode: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { shortCode } = await params;

  if (!shortCode || !SHORT_CODE_RE.test(shortCode)) {
    redirect("/");
  }

  await connectToDatabase();
  const urlDoc = await UrlModel.findOne({ shortCode })
    .select("url deviceCapture expiresAt")
    .lean();

  if (!urlDoc?.url) {
    redirect("/link-error?type=link_not_found");
  }

  if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) <= new Date()) {
    redirect("/link-error?type=link_expired");
  }

  const finalUrl = resolveSafeUrl(urlDoc.url);
  if (!finalUrl) {
    redirect("/?error=invalid_link");
  }

  // Flag switched off after the link was shared — continue straight through.
  if (!urlDoc.deviceCapture) {
    redirect(finalUrl);
  }

  const hdrs = await headers();
  const query = await searchParams;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") search.append(key, value);
    else if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
  }
  const qs = search.toString();
  // Only the query string and protocol of this URL are read for analytics;
  // the destination origin is just a dynamic base, never a redirect target.
  const requestUrl = new URL(
    `/go/${shortCode}${qs ? `?${qs}` : ""}`,
    finalUrl,
  );

  let eventId: string;
  try {
    eventId = await createInterstitialClickEvent({
      shortCode,
      headers: hdrs,
      requestUrl,
      destinationUrl: finalUrl,
    });
  } catch (err) {
    console.error("[Interstitial] click recording failed:", err);
    redirect(finalUrl);
  }

  return (
    <DeviceInterstitial
      shortCode={shortCode}
      eventId={eventId}
      destinationUrl={finalUrl}
    />
  );
}
