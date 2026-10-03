"use client";

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TimeSeriesChartProps {
  data: { date: string; count: number }[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="rounded-none border-border/40 hover:border-primary/30 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">Traffic Over Time</CardTitle>
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-60 sm:h-70 text-sm text-muted-foreground/70 border border-dashed border-border/50 rounded-none bg-muted/5">
            <p>No traffic data available yet</p>
          </div>
        ) : (
          <div className="h-55 sm:h-65 w-full text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const displayLabel = (label as unknown) instanceof Date 
                        ? (label as unknown as Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : (typeof label === 'string' || typeof label === 'number') && !isNaN(new Date(label).getTime())
                          ? new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : String(label);
                          
                      return (
                        <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 text-xs shadow-md border border-border/10 rounded-none">
                          <div className="opacity-90 mb-1 font-medium">{displayLabel}</div>
                          <div className="font-bold text-sm">
                            {payload[0].name}: {payload[0].value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Clicks"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
