"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAnalyticsSummary } from "@/store/analytics-slice";
import { AlertCircle, LayoutGrid, Table as TableIcon, Search, SearchX, ChartNoAxesCombined, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnalyticsTable } from "@/components/analytics/analytics-table";
import { LinkSummaryCard } from "@/components/analytics/link-summary-card";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "table" | "grid";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { summaryList, summaryLoading, summaryError } = useAppSelector((state) => state.analytics);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return summaryList;
    const q = searchQuery.toLowerCase();
    return summaryList.filter(
      (s) =>
        s.shortCode.toLowerCase().includes(q) ||
        s.originalUrl.toLowerCase().includes(q)
    );
  }, [summaryList, searchQuery]);

  useEffect(() => {
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Analytics
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
              Track clicks, visitors, and performance metrics for your short links.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-64 pl-9 pr-8 rounded-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-none p-1 shrink-0">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-7 px-3"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-7 px-3"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
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
            <AnalyticsTable data={filteredList} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredList.map((summary) => (
                <LinkSummaryCard key={summary.shortCode} summary={summary} />
              ))}
            </div>
          )}

          {filteredList.length === 0 && !summaryLoading && (
            <div className="flex flex-col items-center justify-center py-24 px-4 gap-4">
              {searchQuery ? (
                <SearchX className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
              ) : (
                <ChartNoAxesCombined className="h-12 w-12 text-primary/40" strokeWidth={1} />
              )}
              <div className="text-center space-y-1.5 max-w-sm">
                <p className="text-lg font-medium text-foreground tracking-tight">
                  {searchQuery ? "No results found" : "No analytics data available"}
                </p>
                <p className="text-md text-muted-foreground">
                  {searchQuery ? `We couldn't find any links matching "${searchQuery}".` : "Create a short link to start tracking clicks, locations, and visitor insights."}
                </p>
              </div>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-2 text-muted-foreground hover:text-foreground">
                  Clear search
                </Button>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
