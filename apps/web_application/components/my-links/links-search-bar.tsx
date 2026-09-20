"use client";

import { ArrowUpDown, MousePointerClick, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSearch, setSortBy, toggleSortOrder, fetchLinks } from "@/store/my-links-slice";

export function LinksSearchBar() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.myLinks.search);
  const sortBy = useAppSelector((s) => s.myLinks.sortBy);
  const sortOrder = useAppSelector((s) => s.myLinks.sortOrder);

  const handleSortChange = (by: "createdAt" | "clicks") => {
    if (sortBy === by) {
      dispatch(toggleSortOrder());
    } else {
      dispatch(setSortBy(by));
    }
    // Trigger a fresh fetch after sort changes
    // Use setTimeout(0) to ensure the state is updated before fetch reads it
    setTimeout(() => dispatch(fetchLinks({ page: 1, append: false, force: true })), 0);
  };

  return (
    <Card className="rounded-none border-border bg-card shadow-2xs p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by short code or destination URL..."
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="pl-9 pr-8 h-9 text-sm bg-background border-input rounded-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {search && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch(setSearch(""))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange("createdAt")}
            className={`text-xs h-9 gap-1 rounded-none ${
              sortBy === "createdAt" ? "border-primary/50 text-foreground" : "text-muted-foreground"
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>
              Date {sortBy === "createdAt" && (sortOrder === "desc" ? "↓" : "↑")}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange("clicks")}
            className={`text-xs h-9 gap-1 rounded-none ${
              sortBy === "clicks" ? "border-primary/50 text-foreground" : "text-muted-foreground"
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>
              Clicks {sortBy === "clicks" && (sortOrder === "desc" ? "↓" : "↑")}
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
