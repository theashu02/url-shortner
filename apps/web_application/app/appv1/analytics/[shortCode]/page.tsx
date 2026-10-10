"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLinkAnalytics, clearDetailedAnalytics } from "@/store/analytics-slice";
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Smartphone,
  ArrowUpRight,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { BreakdownCard } from "@/components/analytics/breakdown-card";
import { AnalyticsDetailSkeleton } from "@/components/analytics/analytics-skeleton";
import type { BreakdownItem } from "@/server/services/analytics";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-bold uppercase tracking-widest text-foreground">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

function Insight({
  icon: Icon,
  value,
  caption,
  swatch,
}: {
  icon: LucideIcon;
  value: string;
  caption: string;
  swatch: string;
}) {
  return (
    <div className="flex items-center gap-3 border bg-card p-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${swatch}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-lg font-extrabold tracking-tight text-foreground">
          {value}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {caption}
        </span>
      </span>
    </div>
  );
}

export default function AnalyticsDetailPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { detailedData: data, detailedLoading: loading, detailedError: error } = useAppSelector((state) => state.analytics);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shortCode) {
      dispatch(fetchLinkAnalytics(shortCode));
    }
    return () => {
      dispatch(clearDetailedAnalytics());
    };
  }, [dispatch, shortCode]);

  const handleCopyShortLink = async () => {
    if (!shortCode) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${shortCode}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no visual change.
    }
  };

  if (loading || !data) {
    if (error) {
      return (
        <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-7xl mx-auto flex h-[50vh] flex-col items-center justify-center">
            <div className="w-full max-w-md text-center space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-none">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium text-destructive">Analytics Unavailable</p>
                  <p className="text-xs text-destructive/80">{error}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-none" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return <AnalyticsDetailSkeleton />;
  }

  const topOf = (items: BreakdownItem[]) => items[0] ?? null;
  const shareOf = (count: number) =>
    data.totalClicks > 0 ? Math.round((count / data.totalClicks) * 100) : 0;

  const continueRate = shareOf(data.continuedClicks);
  const topCountry = topOf(data.countries);
  const topDevice = topOf(data.devices);
  const topReferrer = topOf(data.referrers);

  const insights = [
    topCountry && {
      icon: Globe,
      swatch: "bg-lake text-on-lake",
      value: topCountry.id,
      caption: `${topCountry.count.toLocaleString()} clicks · ${shareOf(topCountry.count)}% of traffic`,
    },
    topDevice && {
      icon: Smartphone,
      swatch: "bg-ember text-on-ember",
      value: topDevice.id,
      caption: `${topDevice.count.toLocaleString()} clicks · ${shareOf(topDevice.count)}% of traffic`,
    },
    topReferrer && {
      icon: Link2,
      swatch: "bg-inkband text-on-inkband",
      value: topReferrer.id,
      caption: `${topReferrer.count.toLocaleString()} clicks · ${shareOf(topReferrer.count)}% of traffic`,
    },
    data.totalClicks > 0 && {
      icon: ArrowUpRight,
      swatch: "bg-lime-soft text-on-lime",
      value: `${continueRate}% continue-through`,
      caption: `${data.continuedClicks.toLocaleString()} of ${data.totalClicks.toLocaleString()} continued`,
    },
  ].filter((i): i is { icon: LucideIcon; swatch: string; value: string; caption: string } => Boolean(i));

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <Button
            variant="link"
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              <span className="inline-block h-2.5 w-2.5 bg-ember" aria-hidden="true" />
              Link analytics
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="min-w-0 truncate font-mono text-3xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {shortCode}
              </h1>
              {data.totalClicks > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1.5 border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-ember opacity-60" />
                    <span className="relative inline-flex h-2 w-2 bg-ember" />
                  </span>
                  <span className="tabular-nums">{continueRate}% continue-through</span>
                </span>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={data.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-none"
              >
                <span className="truncate max-w-70 sm:max-w-md">{data.originalUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyShortLink}
                aria-label={copied ? "Short link copied" : "Copy short link"}
                className="h-7 w-7 shrink-0 rounded-none text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-ember" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <SummaryCards
          totalClicks={data.totalClicks}
          uniqueVisitors={data.uniqueVisitors}
          continuedClicks={data.continuedClicks}
          capturedCount={data.capturedCount}
        />

        <TimeSeriesChart data={data.timeline} />

        {insights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.map((insight) => (
              <Insight
                key={insight.caption}
                icon={insight.icon}
                swatch={insight.swatch}
                value={insight.value}
                caption={insight.caption}
              />
            ))}
          </div>
        )}

        <Section title="Traffic sources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <BreakdownCard title="Referrers" data={data.referrers} />
            <BreakdownCard title="UTM Sources" data={data.utmSources} emptyMessage="No UTM sources" />
            <BreakdownCard title="UTM Mediums" data={data.utmMediums} emptyMessage="No UTM mediums" />
            <BreakdownCard title="UTM Campaigns" data={data.utmCampaigns} emptyMessage="No UTM campaigns" />
          </div>
        </Section>

        <Section title="Audience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <BreakdownCard title="Countries" data={data.countries} />
            <BreakdownCard title="Cities" data={data.cities} />
            <BreakdownCard title="Languages" data={data.languages} />
          </div>
        </Section>

        <Section title="Technology">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <BreakdownCard title="Devices" data={data.devices} />
            <BreakdownCard title="Operating Systems" data={data.os} />
            <BreakdownCard title="Browsers" data={data.browsers} />
            <BreakdownCard title="Screen Sizes" data={data.screens} emptyMessage="No device details captured" />
            <BreakdownCard title="Connections" data={data.connections} emptyMessage="No connection data" />
          </div>
        </Section>
      </div>
    </div>
  );
}
