import {
  MousePointerClick,
  Users,
  ArrowUpRight,
  MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";

interface SummaryCardsProps {
  totalClicks: number;
  uniqueVisitors: number;
  continuedClicks: number;
  capturedCount: number;
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  swatch,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
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
          {sub && (
            <span className="ml-1.5 align-middle text-xs font-semibold text-muted-foreground">
              {sub}
            </span>
          )}
        </span>
        <span className="block text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      </span>
    </div>
  );
}

export function SummaryCards({
  totalClicks,
  uniqueVisitors,
  continuedClicks,
  capturedCount,
}: SummaryCardsProps) {
  const continueRate =
    totalClicks > 0 ? Math.round((continuedClicks / totalClicks) * 100) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Kpi
        icon={MousePointerClick}
        label="Total clicks"
        value={totalClicks.toLocaleString()}
        swatch="bg-ember text-on-ember"
      />
      <Kpi
        icon={Users}
        label="Unique visitors"
        value={uniqueVisitors.toLocaleString()}
        swatch="bg-lake text-on-lake"
      />
      <Kpi
        icon={ArrowUpRight}
        label="Continued"
        value={continuedClicks.toLocaleString()}
        sub={totalClicks > 0 ? `${continueRate}%` : undefined}
        swatch="bg-lime-soft text-on-lime"
      />
      <Kpi
        icon={MonitorSmartphone}
        label="Device profiles"
        value={capturedCount.toLocaleString()}
        swatch="bg-inkband text-on-inkband"
      />
    </section>
  );
}
