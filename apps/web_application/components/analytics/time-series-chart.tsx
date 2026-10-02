"use client";

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TimeSeriesChartProps {
  data: { date: string; count: number }[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card className="rounded-none border-border/40 shadow-sm mb-8 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Traffic Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    padding: "8px 12px"
                  }}
                  itemStyle={{ color: "hsl(var(--primary))", fontWeight: 600, padding: 0 }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Clicks"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
