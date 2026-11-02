import { GithubDarkModeLogo, GithubLightModeLogo, InstaGramLOGO, RedditLogo, SOCIAL_LOGOS } from "./socialLogos";
import { GUEST_LOGO } from "@/utils/constant";

export type SocialBrandKey = "telegram" | "x" | "linkedin" | "whatsapp" | "mail" | "github" | "instagram" | "reddit";

export interface SocialBrand {
  key: SocialBrandKey | "other";
  label: string;
  logo: string;
}

const BRANDS: Record<SocialBrandKey, { label: string; logo: string; darkLogo?: string }> = {
  telegram: { label: "Telegram", logo: SOCIAL_LOGOS.telegram },
  x: { label: "X", logo: SOCIAL_LOGOS.x.light, darkLogo: SOCIAL_LOGOS.x.dark },
  linkedin: { label: "LinkedIn", logo: SOCIAL_LOGOS.linkedin },
  whatsapp: { label: "WhatsApp", logo: SOCIAL_LOGOS.whatsapp },
  mail: { label: "Mail", logo: SOCIAL_LOGOS.mail },
  github: { label: "GitHub", logo: GithubLightModeLogo, darkLogo: GithubDarkModeLogo },
  instagram: { label: "Instagram", logo: InstaGramLOGO },
  reddit: { label: "Reddit", logo: RedditLogo },
};

const ALIASES: Record<string, SocialBrandKey> = {
  twitter: "x",
  email: "mail",
  gmail: "mail",
  git: "github",
  insta: "instagram",
};

export function normalizeSocialKey(raw: unknown): SocialBrandKey | null {
  if (typeof raw !== "string") return null;
  const compact = raw.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (compact.length === 0) return null;
  const direct = (Object.keys(BRANDS) as SocialBrandKey[]).find(
    (key) => key === compact
  );
  if (direct) return direct;
  return ALIASES[compact] ?? null;
}

export function getSocialBrand(network: unknown, dark = false): SocialBrand {
  const key = normalizeSocialKey(network);
  if (!key) {
    const label = typeof network === "string" && network.trim().length > 0
      ? network.trim().slice(0, 40)
      : "Link";
    return { key: "other", label, logo: GUEST_LOGO };
  }
  const brand = BRANDS[key];
  return {
    key,
    label: brand.label,
    logo: dark && brand.darkLogo ? brand.darkLogo : brand.logo,
  };
}

export function getSocialLogo(network: unknown, dark = false): string {
  return getSocialBrand(network, dark).logo;
}

export const SOCIAL_NETWORK_OPTIONS: { value: SocialBrandKey; label: string; logo: string }[] = (
  Object.keys(BRANDS) as SocialBrandKey[]
).map((key) => ({ value: key, label: BRANDS[key].label, logo: BRANDS[key].logo }));
