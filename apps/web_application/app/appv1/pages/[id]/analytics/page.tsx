"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, MousePointerClick, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownCard } from "@/components/analytics/breakdown-card";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { toast } from "@/components/ui/toast-manager";
import { api } from "@/lib/eden";
import { extractApiMessage } from "@/lib/apiError";
import type { PageAnalytics } from "@/server/services/pages";

const DAY_OPTIONS = [7, 30, 90];

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-2xl font-extrabold tabular-nums text-foreground">
            {value}
          </span>
          <span className="block text-xs text-muted-foreground">{label}</span>
        </span>
      </CardContent>
    </Card>
  );
}

export default function PageAnalyticsRoute() {
  const params = useParams<{ id: string | string[] }>();
  const raw = params?.id;
  const pageId = Array.isArray(raw) ? raw[0] : raw;

  const [data, setData] = useState<PageAnalytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (range: number) => {
      if (!pageId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api
          .pages({ id: pageId })
          .analytics.get({ query: { days: String(range) } });
        if (res.data && "totals" in res.data && res.data.totals) {
          setData(res.data as unknown as PageAnalytics);
          return;
        }
        setError(extractApiMessage(res, "Failed to load analytics."));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        toast.add({
          title: "Analytics failed",
          description: message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [pageId]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(days);
  }, [days, load]);

  if (!pageId) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">Missing page id</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/appv1/pages/${pageId}`} />}
          className="gap-1.5 px-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Editor
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold text-foreground sm:text-2xl">
            {data ? data.page.title : "Page analytics"}
          </h1>
          {data && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              /p/{data.page.slug}
            </p>
          )}
        </div>
        {data && (
          <Badge variant={data.page.status === "published" ? "default" : "secondary"}>
            {data.page.status === "published" ? "Published" : "Draft"}
          </Badge>
        )}
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {DAY_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={days === option ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDays(option)}
              className="rounded-full px-3"
              aria-pressed={days === option}
            >
              {option}d
            </Button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-mist/60"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : error && !data ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Could not load analytics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => load(days)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        data && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Kpi
                icon={Eye}
                label={`Views (last ${data.range.days}d)`}
                value={data.totals.views.toLocaleString()}
              />
              <Kpi
                icon={MousePointerClick}
                label={`Block clicks (last ${data.range.days}d)`}
                value={data.totals.clicks.toLocaleString()}
              />
              <Kpi
                icon={Users}
                label="Unique visitors"
                value={data.totals.uniqueVisitors.toLocaleString()}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <TimeSeriesChart
                data={data.timeline}
                secondary={data.clicksTimeline ?? []}
                secondaryName="Block clicks"
              />
              <BreakdownCard
                title="Devices"
                data={data.devices}
                emptyMessage="No device data yet"
              />
              <BreakdownCard
                title="Referrers"
                data={data.referrers}
                emptyMessage="No referrer data yet"
              />
              <BreakdownCard
                title="Top blocks"
                data={data.topBlocks.map((block) => ({
                  id: block.label ? `${block.label} (${block.key})` : block.key,
                  count: block.count,
                }))}
                emptyMessage="No block clicks yet"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Lifetime totals: {data.page.views.toLocaleString()} views,{" "}
              {data.page.clicks.toLocaleString()} clicks
              {data.page.linkedShortCode
                ? ` - short link /${data.page.linkedShortCode} clicks are counted on the link, not here.`
                : "."}
            </p>
          </>
        )
      )}
    </div>
  );
}