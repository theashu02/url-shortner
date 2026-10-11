import {
  ArrowUpRight,
  Globe,
  Link2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type {
  BreakdownItem,
  DetailedAnalytics,
} from "@/server/services/analytics";

export interface Insight {
  icon: LucideIcon;
  swatch: string;
  value: string;
  caption: string;
}

export function topOf(items: BreakdownItem[]): BreakdownItem | null {
  return items[0] ?? null;
}

export function shareOf(totalClicks: number, count: number): number {
  return totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
}

export function buildInsights(data: DetailedAnalytics): Insight[] {
  const topCountry = topOf(data.countries);
  const topDevice = topOf(data.devices);
  const topReferrer = topOf(data.referrers);
  const continueRate = shareOf(data.totalClicks, data.continuedClicks);

  return [
    topCountry && {
      icon: Globe,
      swatch: "bg-lake text-on-lake",
      value: topCountry.id,
      caption: `${topCountry.count.toLocaleString()} clicks - ${shareOf(data.totalClicks, topCountry.count)}% of traffic`,
    },
    topDevice && {
      icon: Smartphone,
      swatch: "bg-ember text-on-ember",
      value: topDevice.id,
      caption: `${topDevice.count.toLocaleString()} clicks - ${shareOf(data.totalClicks, topDevice.count)}% of traffic`,
    },
    topReferrer && {
      icon: Link2,
      swatch: "bg-inkband text-on-inkband",
      value: topReferrer.id,
      caption: `${topReferrer.count.toLocaleString()} clicks - ${shareOf(data.totalClicks, topReferrer.count)}% of traffic`,
    },
    data.totalClicks > 0 && {
      icon: ArrowUpRight,
      swatch: "bg-lime-soft text-on-lime",
      value: `${continueRate}% continue-through`,
      caption: `${data.continuedClicks.toLocaleString()} of ${data.totalClicks.toLocaleString()} continued`,
    },
  ].filter((insight): insight is Insight => Boolean(insight));
}
