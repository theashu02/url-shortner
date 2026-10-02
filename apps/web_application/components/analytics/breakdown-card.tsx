import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownItem } from "@/server/services/analytics";

interface BreakdownCardProps {
  title: string;
  data: BreakdownItem[];
  emptyMessage?: string;
  delay?: number;
}

export function BreakdownCard({ title, data, emptyMessage = "No data available", delay = 0 }: BreakdownCardProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="rounded-none border-border/40 hover:border-primary/30 transition-colors h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[100px] sm:min-h-[120px] text-sm text-muted-foreground/70 border border-dashed border-border/50 rounded-none bg-muted/5">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[180px] sm:max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-primary-50">
            {data.map((item, index) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={index} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate pr-3" title={item.id}>
                      {item.id}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap text-xs tabular-nums">
                      {item.count.toLocaleString()} <span className="opacity-50">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-none overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-none transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
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
