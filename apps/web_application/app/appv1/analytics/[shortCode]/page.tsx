"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLinkAnalytics, clearDetailedAnalytics } from "@/store/analytics-slice";
import { Loader2, ArrowLeft, ExternalLink, BarChart3, Globe2, Laptop2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { BreakdownCard } from "@/components/analytics/breakdown-card";
import { motion } from "framer-motion";

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
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8">
        {error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-destructive/5 border border-destructive/20 p-6 rounded-none max-w-md text-center space-y-4">
            <div>
              <p className="font-semibold text-foreground">Analytics Unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button variant="outline" className="w-full rounded-none" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </motion.div>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-3 text-muted-foreground hover:text-foreground rounded-none"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            /{shortCode}
          </h1>
          <a 
            href={data.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
          >
            <span className="truncate max-w-md">{data.originalUrl}</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1.5 shrink-0" />
          </a>
        </div>
      </motion.div>

      <SummaryCards totalClicks={data.totalClicks} uniqueVisitors={data.uniqueVisitors} />
      
      <TimeSeriesChart data={data.timeline} />

      <Tabs defaultValue="overview" className="w-full mt-8">
        <TabsList className="bg-muted/50 rounded-none mb-6">
          <TabsTrigger value="overview" className="rounded-none px-4 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="location" className="rounded-none px-4 data-[state=active]:bg-background">
            <Globe2 className="h-4 w-4 mr-2" /> Location
          </TabsTrigger>
          <TabsTrigger value="tech" className="rounded-none px-4 data-[state=active]:bg-background">
            <Laptop2 className="h-4 w-4 mr-2" /> Tech
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BreakdownCard title="Referrers" data={data.referrers} delay={0.1} />
            <BreakdownCard title="UTM Sources" data={data.utmSources} emptyMessage="No UTM sources" delay={0.15} />
            <BreakdownCard title="UTM Campaigns" data={data.utmCampaigns} emptyMessage="No UTM campaigns" delay={0.2} />
          </div>
        </TabsContent>

        <TabsContent value="location" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BreakdownCard title="Countries" data={data.countries} delay={0.1} />
            <BreakdownCard title="Cities" data={data.cities} delay={0.15} />
          </div>
        </TabsContent>

        <TabsContent value="tech" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BreakdownCard title="Devices" data={data.devices} delay={0.1} />
            <BreakdownCard title="Operating Systems" data={data.os} delay={0.15} />
            <BreakdownCard title="Browsers" data={data.browsers} delay={0.2} />
            <BreakdownCard title="Languages" data={data.languages} delay={0.25} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
