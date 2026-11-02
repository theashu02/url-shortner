import type { ReactNode } from "react";
import { BreakdownCard } from "@/components/analytics/breakdown-card";
import type { DetailedAnalytics } from "@/server/services/analytics";

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

export function TrafficSourcesSection({ data }: { data: DetailedAnalytics }) {
  return (
    <DetailSection title="Traffic sources">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <BreakdownCard title="Referrers" data={data.referrers} />
        <BreakdownCard title="UTM Sources" data={data.utmSources} emptyMessage="No UTM sources" />
        <BreakdownCard title="UTM Mediums" data={data.utmMediums} emptyMessage="No UTM mediums" />
        <BreakdownCard title="UTM Campaigns" data={data.utmCampaigns} emptyMessage="No UTM campaigns" />
      </div>
    </DetailSection>
  );
}

export function AudienceSection({ data }: { data: DetailedAnalytics }) {
  return (
    <DetailSection title="Audience">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BreakdownCard title="Countries" data={data.countries} />
        <BreakdownCard title="Cities" data={data.cities} />
        <BreakdownCard title="Languages" data={data.languages} />
      </div>
    </DetailSection>
  );
}

export function TechnologySection({ data }: { data: DetailedAnalytics }) {
  return (
    <DetailSection title="Technology">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BreakdownCard title="Devices" data={data.devices} />
        <BreakdownCard title="Operating Systems" data={data.os} />
        <BreakdownCard title="Browsers" data={data.browsers} />
        <BreakdownCard title="Screen Sizes" data={data.screens} emptyMessage="No device details captured" />
        <BreakdownCard title="Connections" data={data.connections} emptyMessage="No connection data" />
      </div>
    </DetailSection>
  );
}
