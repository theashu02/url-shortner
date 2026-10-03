import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MousePointerClick, Users, Globe, Smartphone, ArrowRight } from "lucide-react";
import { AnalyticsSummaryItem } from "@/server/services/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LinkSummaryCardProps {
  summary: AnalyticsSummaryItem;
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
    <Link href={`/appv1/analytics/${shortCode}`} className="block group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none">
      <Card className="rounded-none border-border/40 hover:border-primary/30 hover:bg-muted/10 transition-all duration-200 cursor-pointer h-full flex flex-col md:flex-row md:items-center relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="flex-1 min-w-0 pb-2 md:pb-3 pt-3 sm:pt-4 pl-3 sm:pl-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <span className="font-semibold truncate">/{shortCode}</span>
            {lastClickedAt && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/80 px-1.5 py-0.5 rounded-none font-medium whitespace-nowrap">
                Active {formatDistanceToNow(new Date(lastClickedAt), { addSuffix: true })}
              </span>
            )}
          </CardTitle>
          <CardDescription className="truncate text-xs mt-0.5" title={originalUrl}>
            {originalUrl}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center gap-3 sm:gap-4 text-sm pb-3 sm:pb-4 pt-0 md:pt-3 pr-3 sm:pr-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-none">
            <div className="flex flex-col gap-0.5" title="Total Clicks">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MousePointerClick className="h-2.5 w-2.5" /> Clicks
              </span>
              <span className="font-medium text-foreground text-xs tabular-nums">{totalClicks.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col gap-0.5" title="Unique Visitors">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="h-2.5 w-2.5" /> Visitors
              </span>
              <span className="font-medium text-foreground text-xs tabular-nums">{uniqueVisitors.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex flex-col gap-1 border-l border-border/50 pl-3 sm:pl-4">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground" title="Top Country">
                <Globe className="h-2.5 w-2.5" />
                <span className="truncate max-w-17.5">{topCountry || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground" title="Top Device">
                <Smartphone className="h-2.5 w-2.5" />
                <span className="truncate max-w-17.5">{topDevice || "-"}</span>
              </div>
            </div>
          </div>
          
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 ml-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
