import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownItem } from "@/server/services/analytics";
import { motion } from "framer-motion";

interface BreakdownCardProps {
  title: string;
  data: BreakdownItem[];
  emptyMessage?: string;
  delay?: number;
}

export function BreakdownCard({ title, data, emptyMessage = "No data available", delay = 0 }: BreakdownCardProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay }}>
      <Card className="rounded-none border-border/40 shadow-sm h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-sm text-muted-foreground/60 border border-dashed border-border/50 rounded-none bg-muted/10">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-3 custom-scrollbar">
              {data.map((item, index) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={index} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate pe-4">{item.id}</span>
                      <span className="text-muted-foreground whitespace-nowrap text-xs tabular-nums">
                        {item.count.toLocaleString()} <span className="opacity-50">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-none overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-primary rounded-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
