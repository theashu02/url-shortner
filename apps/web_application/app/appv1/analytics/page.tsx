"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAnalyticsSummary } from "@/store/analytics-slice";
import { AlertCircle, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsTable } from "@/components/analytics/analytics-table";
import { LinkSummaryCard } from "@/components/analytics/link-summary-card";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "table" | "grid";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { summaryList, summaryLoading, summaryError } = useAppSelector((state) => state.analytics);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
            Track clicks, visitors, and performance metrics for your short links.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-none p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {summaryError && (
        <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-none">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Failed to load analytics</p>
            <p className="text-xs text-destructive/80">{summaryError}</p>
          </div>
        </div>
      )}

      {summaryLoading && summaryList.length === 0 ? (
        viewMode === "table" ? (
          <div className="border border-border/40 rounded-none overflow-hidden">
            <div className="border-b border-border/40 bg-muted/30 p-2">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-24 rounded-none" />
                <Skeleton className="h-3 w-32 rounded-none" />
                <Skeleton className="h-3 w-16 rounded-none ml-auto" />
                <Skeleton className="h-3 w-16 rounded-none" />
                <Skeleton className="h-3 w-16 rounded-none hidden sm:block" />
                <Skeleton className="h-3 w-16 rounded-none hidden sm:block" />
                <Skeleton className="h-3 w-20 rounded-none hidden md:block" />
                <Skeleton className="h-3 w-8 rounded-none" />
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-border/40 last:border-b-0 p-2.5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3.5 w-20 rounded-none" />
                  <Skeleton className="h-3.5 w-full max-w-lg rounded-none" />
                  <Skeleton className="h-3.5 w-16 rounded-none ml-auto" />
                  <Skeleton className="h-3.5 w-16 rounded-none" />
                  <Skeleton className="h-3.5 w-16 rounded-none hidden sm:block" />
                  <Skeleton className="h-3.5 w-16 rounded-none hidden sm:block" />
                  <Skeleton className="h-3.5 w-20 rounded-none hidden md:block" />
                  <Skeleton className="h-3.5 w-8 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border/40 rounded-none p-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20 rounded-none" />
                  <Skeleton className="h-3 w-full rounded-none" />
                  <div className="flex items-center gap-3 mt-2">
                    <Skeleton className="h-3 w-12 rounded-none" />
                    <Skeleton className="h-3 w-12 rounded-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {viewMode === "table" ? (
            <AnalyticsTable data={summaryList} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {summaryList.map((summary) => (
                <LinkSummaryCard key={summary.shortCode} summary={summary} />
              ))}
            </div>
          )}

          {summaryList.length === 0 && !summaryLoading && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 border border-dashed border-border/60 rounded-none bg-muted/5">
              <div className="text-center space-y-2 max-w-md">
                <p className="text-sm font-medium text-muted-foreground">
                  No analytics data available
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Create a short link to start tracking clicks and visitor insights.
                </p>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
