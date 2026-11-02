"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface TableSentinelProps {
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  linkCount: number;
}

export const TableSentinel = forwardRef<HTMLDivElement, TableSentinelProps>(function TableSentinel(
  { loadingMore, hasMore, totalCount, linkCount },
  ref,
) {
  return (
    <div ref={ref} className="border-t border-border/40 p-4 text-center">
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-ember" />
          <span>Loading more links...</span>
        </div>
      )}
      {!hasMore && linkCount > 0 && (
        <p className="py-1 text-xs tracking-wide text-muted-foreground">All {totalCount} links loaded</p>
      )}
    </div>
  );
});
