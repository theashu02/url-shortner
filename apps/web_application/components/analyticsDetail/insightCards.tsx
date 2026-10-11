import type { Insight } from "./detailUtils";

export function InsightCards({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight) => (
        <div
          key={insight.caption}
          className="flex items-center gap-3 border border-border bg-card p-4 shadow-sm"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center ${insight.swatch}`}
          >
            <insight.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold tracking-tight text-foreground">
              {insight.value}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {insight.caption}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
