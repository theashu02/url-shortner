"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  RefreshCw,
  Plus,
  Link2,
  MousePointerClick,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchLinks } from "@/store/my-links-slice";
import { throttle } from "@/lib/throttle";
import { REFRESH_THROTTLE_MS } from "@/lib/constant";

function Metric({
  icon: Icon,
  label,
  value,
  swatch,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
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
        <span className="block truncate text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        <span className="block text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      </span>
    </div>
  );
}

export function LinksHeader() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.myLinks.loading);
  const totalCount = useAppSelector((s) => s.myLinks.totalCount);
  const links = useAppSelector((s) => s.myLinks.links);

  const throttledRefresh = useMemo(
    () =>
      throttle(
        () => dispatch(fetchLinks({ page: 1, append: false, force: true })),
        REFRESH_THROTTLE_MS,
      ),
    [dispatch],
  );

  useEffect(() => () => throttledRefresh.cancel(), [throttledRefresh]);

  const loadedCount = links.length;
  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            <span className="inline-block h-2.5 w-2.5 bg-ember" aria-hidden="true" />
            Link library
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
            My Links
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
            Manage, search, and track all your shortened URLs and QR codes.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={throttledRefresh}
            disabled={loading}
            className="gap-1.5 text-xs h-9 rounded-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/appv1/custom-links">
            <Button size="sm" className="gap-1.5 text-xs h-9 font-semibold rounded-none">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Link</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Metric icon={Link2} label="Total links" value={totalCount.toLocaleString()} swatch="bg-ember text-on-ember" />
        <Metric icon={MousePointerClick} label="Total clicks" value={totalClicks.toLocaleString()} swatch="bg-lake text-on-lake" />
        <Metric icon={Layers} label="Loaded" value={loadedCount.toLocaleString()} swatch="bg-lime-soft text-on-lime" />
      </div>
    </div>
  );
}
