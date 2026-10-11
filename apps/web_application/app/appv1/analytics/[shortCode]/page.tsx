"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLinkAnalytics, clearDetailedAnalytics } from "@/store/analytics-slice";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { AnalyticsDetailSkeleton } from "@/components/analytics/analytics-skeleton";
import {
  AudienceSection,
  DetailEmpty,
  DetailError,
  DetailHeader,
  InsightCards,
  TechnologySection,
  TrafficSourcesSection,
  buildInsights,
  shareOf,
} from "@/components/analyticsDetail";

export default function AnalyticsDetailPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    detailedData: data,
    detailedLoading: loading,
    detailedError: error,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    if (shortCode) dispatch(fetchLinkAnalytics(shortCode));
    return () => {
      dispatch(clearDetailedAnalytics());
    };
  }, [dispatch, shortCode]);

  const handleBack = () => router.back();
  const handleRefresh = () => {
    if (shortCode) dispatch(fetchLinkAnalytics(shortCode));
  };

  if (loading || !data) {
    if (error) return <DetailError error={error} onBack={handleBack} />;
    return <AnalyticsDetailSkeleton />;
  }

  const continueRate = shareOf(data.totalClicks, data.continuedClicks);
  const hasTraffic = data.totalClicks > 0;

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
        <DetailHeader
          shortCode={shortCode}
          originalUrl={data.originalUrl}
          totalClicks={data.totalClicks}
          continueRate={continueRate}
          refreshing={loading}
          onRefresh={handleRefresh}
          onBack={handleBack}
        />

        <SummaryCards
          totalClicks={data.totalClicks}
          uniqueVisitors={data.uniqueVisitors}
          continuedClicks={data.continuedClicks}
          capturedCount={data.capturedCount}
        />

        {hasTraffic ? (
          <>
            <TimeSeriesChart data={data.timeline} />
            <InsightCards insights={buildInsights(data)} />
            <TrafficSourcesSection data={data} />
            <AudienceSection data={data} />
            <TechnologySection data={data} />
          </>
        ) : (
          <DetailEmpty shortCode={shortCode} />
        )}
      </div>
    </div>
  );
}
