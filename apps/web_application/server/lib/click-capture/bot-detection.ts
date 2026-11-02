import { isbot } from "isbot";

const PREVIEW_CRAWLER_PATTERNS: RegExp[] = [
  /facebookexternalhit/i,
  /Facebot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /TelegramBot/i,
  /SkypeUriPreview/i,
  /vkShare/i,
  /WhatsApp\/[\d.]+/i,
];

const IN_APP_PATTERNS: Record<string, RegExp> = {
  Instagram: /Instagram/i,
  Facebook: /FBAN|FBAV|FB_IAB/i,
  Twitter: /Twitter/i,
  LinkedIn: /LinkedInApp/i,
  Snapchat: /Snapchat/i,
  TikTok: /TikTok|BytedanceWebview/i,
  Pinterest: /Pinterest/i,
  WeChat: /MicroMessenger/i,
  Line: /\bLine\//i,
};

export interface BotCheckResult {
  isBot: boolean;
  reason: string | null;
}

export function detectBot(userAgent: string): BotCheckResult {
  if (!userAgent) return { isBot: true, reason: "missing-user-agent" };

  if (isbot(userAgent)) {
    return { isBot: true, reason: "known-crawler" };
  }

  for (const pattern of PREVIEW_CRAWLER_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, reason: `preview-crawler:${pattern.source}` };
    }
  }

  return { isBot: false, reason: null };
}

export function detectInAppBrowser(userAgent: string): string | null {
  for (const [name, pattern] of Object.entries(IN_APP_PATTERNS)) {
    if (pattern.test(userAgent)) return name;
  }
  return null;
}
