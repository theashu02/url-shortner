export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface MergedTimeSeriesPoint {
  date: string;
  count: number;
  secondary?: number;
}

export function mergeTimeSeries(
  data: TimeSeriesPoint[] | undefined,
  secondary: TimeSeriesPoint[] | undefined,
): MergedTimeSeriesPoint[] {
  const byDate = new Map<string, MergedTimeSeriesPoint>();
  for (const row of data ?? []) {
    byDate.set(row.date, { date: row.date, count: row.count });
  }
  for (const row of secondary ?? []) {
    const existing = byDate.get(row.date);
    if (existing) existing.secondary = row.count;
    else byDate.set(row.date, { date: row.date, count: 0, secondary: row.count });
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}
