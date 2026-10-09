import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
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
    <div className="flex min-w-0 gap-2" title={`${label}: ${value}`}>
      <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="text-foreground truncate text-[13px] font-medium tabular-nums">{value}</p>
    </div>
  );
}

export function LinkSummaryCard({ summary }: LinkSummaryCardProps) {
  const {
    shortCode,
    originalUrl,
    totalClicks,
    uniqueVisitors,
    lastClickedAt,
    topCountry,
    topDevice,
  } = summary;

  return (
    <Link
      href={`/appv1/analytics/${shortCode}`}
      aria-label={`View analytics for /${shortCode}`}
      className="group focus-visible:ring-ring block h-full min-w-0 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Card className="border-border/40 hover:border-foreground/20 hover:bg-muted/20 flex h-full flex-col rounded-none transition-colors">
        <CardHeader className="min-w-0 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="min-w-0 flex-1 truncate text-sm font-semibold">
              {shortCode}
            </CardTitle>
            {lastClickedAt && (
              <span className="text-muted-foreground shrink-0 text-[11px] whitespace-nowrap tabular-nums">
                {formatDistanceToNow(new Date(lastClickedAt), {
                  addSuffix: true,
                })}
              </span>
            )}
            <ArrowRight className="text-muted-foreground/40 group-hover:text-foreground h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
          </div>
          <CardDescription className="truncate text-xs" title={originalUrl}>
            {displayUrl(originalUrl)}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end px-4 pt-0 pb-0">
          <div className="border-border/50 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t pt-3">
            <Stat icon={MousePointerClick} label="Clicks" value={totalClicks.toLocaleString()} />
            <Stat icon={Users} label="Visitors" value={uniqueVisitors.toLocaleString()} />
            <Stat icon={Globe} label="Top country" value={topCountry || "NA"} />
            <Stat icon={Smartphone} label="Top device" value={topDevice || "NA" } />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
