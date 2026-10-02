"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAnalyticsSummary } from "@/store/analytics-slice";
import { Loader2 } from "lucide-react";
import { LinkSummaryCard } from "@/components/analytics/link-summary-card";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { summaryList, summaryLoading, summaryError } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Select a link to view detailed performance metrics, visitor locations, and device breakdowns.
        </p>
      </motion.div>

      {summaryError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-none text-sm font-medium">
          Error: {summaryError}
        </motion.div>
      )}

      {summaryLoading && summaryList.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col space-y-3"
        >
          {summaryList.map((summary) => (
            <motion.div key={summary.shortCode} variants={item}>
              <LinkSummaryCard summary={summary} />
            </motion.div>
          ))}
          
          {summaryList.length === 0 && !summaryLoading && (
            <motion.div variants={item} className="py-16 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-none bg-muted/10">
              No data available yet. Create a short link to start tracking.
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
