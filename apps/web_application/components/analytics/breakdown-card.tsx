import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownItem } from "@/server/services/analytics";

interface BreakdownCardProps {
  title: string;
  data: BreakdownItem[];
  emptyMessage?: string;
  delay?: number;
}

const chartColors = [
  "from-chart-1 to-chart-1/80",
  "from-chart-2 to-chart-2/80",
  "from-chart-3 to-chart-3/80",
  "from-chart-4 to-chart-4/80",
  "from-chart-5 to-chart-5/80",
];

export function BreakdownCard({ title, data, emptyMessage = "No data available" }: BreakdownCardProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sortedData[0]?.count || 0;

  return (
    <Card className="border-border/10 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl h-full flex flex-col shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
          {total > 0 && (
            <div className="text-xs text-muted-foreground font-medium tabular-nums">
              {total.toLocaleString()} total
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0 relative">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-35 gap-2">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground/70">{emptyMessage}</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-55 overflow-y-auto pr-2">
            {sortedData.map((item, index) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const relativeSize = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const colorClass = chartColors[index % chartColors.length];
              const isTop = index === 0;

              return (
                <div key={item.id} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isTop && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                      )}
                      <span className="font-medium text-foreground truncate" title={item.id}>
                        {item.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-muted-foreground whitespace-nowrap text-xs tabular-nums font-medium">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground/40 text-xs tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-linear-to-r ${colorClass} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${relativeSize}%` }}
                    >
                      {isTop && (
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      )}
                    </div>
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
