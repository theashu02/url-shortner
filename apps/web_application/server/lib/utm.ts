export interface UtmParamsInput {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function appendUtmParams(originalUrl: string, utms?: UtmParamsInput | null): string {
  if (!utms) return originalUrl;

  const pairs: string[] = [];

  const add = (key: string, val?: string) => {
    if (val && val.trim().length > 0) {
      pairs.push(`${key}=${encodeURIComponent(val.trim())}`);
    }
  };

  add("utm_source", utms.source);
  add("utm_medium", utms.medium);
  add("utm_campaign", utms.campaign);
  add("utm_term", utms.term);
  add("utm_content", utms.content);

  if (pairs.length === 0) return originalUrl;

  const queryString = pairs.join("&");
  const separator = originalUrl.includes("?") ? "&" : "?";
  
  return `${originalUrl}${separator}${queryString}`;
}
