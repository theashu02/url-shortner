interface SummaryCardsProps {
  totalClicks: number;
  uniqueVisitors: number;
}

export function SummaryCards({ totalClicks, uniqueVisitors }: SummaryCardsProps) {
  return (
    <section className="flex flex-wrap items-baseline gap-x-10 gap-y-2 pb-6 mb-6 border-b border-border/40">
      <div className="flex items-baseline gap-2.5">
        <span className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground tabular-nums">
          {totalClicks.toLocaleString()}
        </span>
        <span className="text-base sm:text-lg text-muted-foreground lowercase">clicks</span>
      </div>
      
      <div className="flex items-baseline gap-2.5">
        <span className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground tabular-nums">
          {uniqueVisitors.toLocaleString()}
        </span>
        <span className="text-base sm:text-lg text-muted-foreground lowercase">unique visitors</span>
      </div>
    </section>
  );
}
