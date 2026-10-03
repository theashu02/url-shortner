import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownItem } from "@/server/services/analytics";
import { GlobeOff } from "lucide-react";

interface BreakdownCardProps {
  title: string;
  data: BreakdownItem[];
  emptyMessage?: string;
  delay?: number;
}

export function BreakdownCard({
  title,
  data,
  emptyMessage = "No data available",
}: BreakdownCardProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sortedData[0]?.count || 0;

  return (
    <Card className="flex flex-col h-full rounded-none border-border/40">
      <CardHeader className="px-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-xl font-medium text-foreground">
            {title}
          </CardTitle>
          {total > 0 && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {total.toLocaleString()} clicks
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-3 pt-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-30 gap-2.5">
            <GlobeOff className="text-muted-foreground/25" size={24} strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground/50">{emptyMessage}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedData.map((item, index) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const relativeSize = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <div key={item.id} className="group relative h-8 flex items-center">
                  {/* Bar fill */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm bg-primary/10 dark:bg-primary/15 transition-all duration-500 ease-out group-hover:bg-primary/15 dark:group-hover:bg-primary/20"
                    style={{ width: `${relativeSize}%` }}
                  />

                  {/* Content over bar */}
                  <div className="relative w-full flex items-center justify-between px-2.5">
                    <span
                      className="text-[13px] text-foreground/80 truncate pr-3"
                      title={item.id}
                    >
                      {index === 0 && sortedData.length > 1 && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 translate-y-[-0.5px]" />
                      )}
                      {item.id}
                    </span>
                    <span className="text-[12px] tabular-nums text-muted-foreground shrink-0">
                      {item.count.toLocaleString()}
                      <span className="ml-1.5 text-muted-foreground/60">{percentage}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
