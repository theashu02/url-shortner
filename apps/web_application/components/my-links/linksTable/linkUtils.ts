import type { LinkItem } from "@/components/my-links/types";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isExpired(link: LinkItem): boolean {
  return !!link.expiresAt && new Date(link.expiresAt) < new Date();
}

export function buildShortUrl(origin: string | undefined, shortCode: string): string {
  return `${origin ?? ""}/${shortCode}`;
}
