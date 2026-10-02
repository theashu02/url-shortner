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
    <Link href={`/appv1/analytics/${shortCode}`} className="block group outline-none">
      <Card className="rounded-none border-border/40 hover:bg-muted/10 transition-colors cursor-pointer h-full flex flex-col md:flex-row md:items-center relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="flex-1 min-w-0 pb-3 md:pb-6 pt-5 pl-6">
          <CardTitle className="text-lg flex items-center gap-3">
            <span className="font-semibold truncate">/{shortCode}</span>
            {lastClickedAt && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-none font-medium whitespace-nowrap">
                Active {formatDistanceToNow(new Date(lastClickedAt), { addSuffix: true })}
              </span>
            )}
          </CardTitle>
          <CardDescription className="truncate text-xs mt-1" title={originalUrl}>
            {originalUrl}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center gap-6 text-sm pb-5 pt-0 md:pt-5 pr-6">
          <div className="flex items-center gap-6 flex-1 md:flex-none">
            <div className="flex flex-col gap-1" title="Total Clicks">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MousePointerClick className="h-3 w-3" /> Clicks
              </span>
              <span className="font-medium text-foreground">{totalClicks.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col gap-1" title="Unique Visitors">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Visitors
              </span>
              <span className="font-medium text-foreground">{uniqueVisitors.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex flex-col gap-1 border-l border-border/50 pl-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Top Country">
                <Globe className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{topCountry || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Top Device">
                <Smartphone className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{topDevice || "-"}</span>
              </div>
            </div>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 ml-2" />
        </CardContent>
      </Card>
    </Link>
  );
}
