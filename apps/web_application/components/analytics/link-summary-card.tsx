import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { AnalyticsSummaryItem } from "@/server/services/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { displayUrl } from "@/lib/constant";

interface LinkSummaryCardProps {
  summary: AnalyticsSummaryItem;
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2" title={`${label}: ${value}`}>
      <p className="text-muted-foreground flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase shrink-0">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="text-foreground truncate text-[13px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function LinkSummaryCard({ summary }: LinkSummaryCardProps) {
  const {
    shortCode,
    originalUrl,
    totalClicks,
    uniqueVisitors,
    continuedClicks,
    capturedCount,
    topScreen,
    lastClickedAt,
    topCountry,
    topDevice,
  } = summary;

  const continueRate =
    totalClicks > 0 ? Math.round((continuedClicks / totalClicks) * 100) : 0;

  return (
    <Link
      href={`/appv1/analytics/${shortCode}`}
      aria-label={`View analytics for /${shortCode}`}
      className="group focus-visible:ring-ring block h-full min-w-0 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Card className="border hover:border-ember bg-card flex h-full flex-col rounded-none transition-colors">
        <CardHeader className="min-w-0 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="min-w-0 flex-1 truncate font-mono text-sm font-bold">
              /{shortCode}
            </CardTitle>
            {capturedCount > 0 && (
              <span className="shrink-0 bg-lime-soft px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-on-lime uppercase">
                Device data
              </span>
            )}
            <ArrowRight className="text-muted-foreground/40 group-hover:text-ember h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
          </div>
          <CardDescription className="truncate text-xs" title={originalUrl}>
            {displayUrl(originalUrl)}
          </CardDescription>
          {lastClickedAt && (
            <p className="text-muted-foreground text-[11px] tabular-nums">
              Last click{" "}
              {formatDistanceToNow(new Date(lastClickedAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end px-4 pt-0 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t pt-3">
            <Stat icon={MousePointerClick} label="Clicks" value={totalClicks.toLocaleString()} />
            <Stat icon={Users} label="Visitors" value={uniqueVisitors.toLocaleString()} />
            <Stat
              icon={ArrowUpRight}
              label="Continued"
              value={totalClicks > 0 ? `${continuedClicks.toLocaleString()} · ${continueRate}%` : "—"}
            />
            <Stat icon={Monitor} label="Top screen" value={topScreen || "—"} />
            <Stat icon={Globe} label="Top country" value={topCountry || "—"} />
            <Stat icon={Smartphone} label="Top device" value={topDevice || "—"} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
