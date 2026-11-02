import type { EnrichedClickEvent } from "./types";

/**
 * Maps an enriched server-side capture to the ClickEvent document shape.
 * Shared by the queue worker and the device-interstitial flow so both
 * persist identical base fields.
 */
export function buildClickEventDoc(
  shortCode: string,
  enriched: EnrichedClickEvent,
) {
  const { geo } = enriched;

  return {
    shortCode,

    browser: enriched.browser,
    browserVersion: enriched.browserVersion,
    os: enriched.os,
    osVersion: enriched.osVersion,
    deviceType: enriched.deviceType,
    deviceVendor: enriched.deviceVendor,
    deviceModel: enriched.deviceModel,
    isBot: enriched.isBot,
    botReason: enriched.botReason,
    inAppBrowser: enriched.inAppBrowser,

    language: enriched.language,
    languageList: enriched.languageList,

    referrer: enriched.referrer,
    referrerDomain: enriched.referrerDomain,
    referrerType: enriched.referrerType,

    utmSource: enriched.utm.utm_source,
    utmMedium: enriched.utm.utm_medium,
    utmCampaign: enriched.utm.utm_campaign,
    utmTerm: enriched.utm.utm_term,
    utmContent: enriched.utm.utm_content,

    ipHash: enriched.ipHash,
    visitorHash: enriched.visitorHash,
    protocol: enriched.protocol,

    geoCountry: geo.country,
    geoRegion: geo.region,
    geoCity: geo.city,
    geoLatitude: geo.latitude,
    geoLongitude: geo.longitude,
    geoTimezone: geo.timezone,
    geoIsp: geo.isp,
    geoOrg: geo.org,
    geoAsNumber: geo.asNumber,

    clickedAt: enriched.clickedAt,
  };
}
