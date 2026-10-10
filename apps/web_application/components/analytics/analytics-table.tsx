import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Globe, Smartphone, Monitor, ArrowRight } from "lucide-react";
import { AnalyticsSummaryItem } from "@/server/services/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsTableProps {
  data: AnalyticsSummaryItem[];
}

export function AnalyticsTable({ data }: AnalyticsTableProps) {
  const router = useRouter();

  return (
    <div className="border bg-card rounded-none overflow-x-auto">
      <Table className="min-w-230">
        <TableHeader>
          <TableRow className="bg-inkband hover:bg-inkband border-b">
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband py-3 px-4">
              Short Code
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband py-3 px-4">
              Original URL
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband text-right py-3 px-4">
              Clicks
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband text-right py-3 px-4">
              Continued
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband hidden lg:table-cell py-3 px-4">
              Top Screen
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband hidden sm:table-cell py-3 px-4">
              Top Country
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband hidden sm:table-cell py-3 px-4">
              Top Device
            </TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-widest text-on-inkband hidden md:table-cell py-3 px-4">
              Last Click
            </TableHead>
            <TableHead className="w-12 py-3 px-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((summary) => {
            const rate =
              summary.totalClicks > 0
                ? Math.round(
                    (summary.continuedClicks / summary.totalClicks) * 100
                  )
                : 0;
            return (
              <TableRow
                key={summary.shortCode}
                className="border-border hover:bg-mist transition-colors cursor-pointer group"
                onClick={() =>
                  router.push(`/appv1/analytics/${summary.shortCode}`)
                }
              >
                <TableCell className="font-mono font-bold text-sm py-3 px-4 group-hover:text-ember transition-colors whitespace-nowrap">
                  {summary.shortCode.length > 6
                    ? `${summary.shortCode.slice(0, 6)}...`
                    : summary.shortCode}
                </TableCell>
                <TableCell
                  className="text-sm text-muted-foreground py-3 px-4"
                  title={summary.originalUrl}
                >
                  <div className="truncate max-w-37.5 sm:max-w-62.5 md:max-w-87.5 lg:max-w-112.5">
                    {summary.originalUrl}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-foreground text-right tabular-nums py-3 px-4 font-medium whitespace-nowrap">
                  {summary.totalClicks.toLocaleString()}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {summary.totalClicks > 0 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-foreground tabular-nums font-medium whitespace-nowrap">
                        {summary.continuedClicks.toLocaleString()}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          {rate}%
                        </span>
                      </span>
                      <span
                        className="block h-1 w-16 bg-muted"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full bg-ember"
                          style={{ width: `${rate}%` }}
                        />
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell py-3 px-4">
                  {summary.topScreen ? (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                      <span className="font-mono text-[13px] whitespace-nowrap">
                        {summary.topScreen}
                      </span>
                    </div>
                  ) : (
                    <span className="opacity-50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                    <span className="truncate max-w-25">
                      {summary.topCountry || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                    <span className="truncate max-w-25">
                      {summary.topDevice || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell py-3 px-4 whitespace-nowrap">
                  {summary.lastClickedAt ? (
                    <span className="opacity-80">
                      {formatDistanceToNow(new Date(summary.lastClickedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    <span className="opacity-50">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-3 px-4 w-12">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-ember group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
