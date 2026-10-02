"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLinkAnalytics, clearDetailedAnalytics } from "@/store/analytics-slice";
import { ArrowLeft, ExternalLink, BarChart3, Globe2, Laptop2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { BreakdownCard } from "@/components/analytics/breakdown-card";
import { AnalyticsDetailSkeleton } from "@/components/analytics/analytics-skeleton";

export default function AnalyticsDetailPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { detailedData: data, detailedLoading: loading, detailedError: error } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    if (shortCode) {
      dispatch(fetchLinkAnalytics(shortCode));
    }
    return () => {
      dispatch(clearDetailedAnalytics());
    };
  }, [dispatch, shortCode]);

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

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
        <Button 
          variant="link" 
          size="sm" 
          className="-ml-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            /{shortCode}
          </h1>
          <a 
            href={data.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-none"
          >
            <span className="truncate max-w-70 sm:max-w-md">{data.originalUrl}</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      <SummaryCards totalClicks={data.totalClicks} uniqueVisitors={data.uniqueVisitors} />
      
      <TimeSeriesChart data={data.timeline} />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div className="w-full flex justify-center sm:justify-start">
          <TabsList className="w-full max-w-xl grid grid-cols-3 sm:w-auto sm:inline-flex h-auto sm:h-12 p-1 gap-1 sm:gap-2 bg-muted/60 dark:bg-muted/30 border border-border rounded-none">
            <TabsTrigger
              value="overview"
              className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-active:bg-primary dark:data-active:bg-primary data-[state=active]:text-primary-foreground data-active:text-primary-foreground dark:data-active:text-primary-foreground data-[state=active]:shadow-sm data-active:shadow-sm transition-all hover:data-active:text-amber-200"
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-active:bg-primary dark:data-active:bg-primary data-[state=active]:text-primary-foreground data-active:text-primary-foreground dark:data-active:text-primary-foreground data-[state=active]:shadow-sm data-active:shadow-sm transition-all hover:data-active:text-amber-200"
            >
              <Globe2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Location</span>
            </TabsTrigger>
            <TabsTrigger
              value="tech"
              className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-active:bg-primary dark:data-active:bg-primary data-[state=active]:text-primary-foreground data-active:text-primary-foreground dark:data-active:text-primary-foreground data-[state=active]:shadow-sm data-active:shadow-sm transition-all hover:data-active:text-amber-200"
            >
              <Laptop2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Tech</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 outline-none focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <BreakdownCard title="Referrers" data={data.referrers} />
            <BreakdownCard title="UTM Sources" data={data.utmSources} emptyMessage="No UTM sources" />
            <BreakdownCard title="UTM Campaigns" data={data.utmCampaigns} emptyMessage="No UTM campaigns" />
          </div>
        </TabsContent>

        <TabsContent value="location" className="mt-4 outline-none focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <BreakdownCard title="Countries" data={data.countries} />
            <BreakdownCard title="Cities" data={data.cities} />
          </div>
        </TabsContent>

        <TabsContent value="tech" className="mt-4 outline-none focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <BreakdownCard title="Devices" data={data.devices} />
            <BreakdownCard title="Operating Systems" data={data.os} />
            <BreakdownCard title="Browsers" data={data.browsers} />
            <BreakdownCard title="Languages" data={data.languages} />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
