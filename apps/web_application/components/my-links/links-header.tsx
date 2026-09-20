"use client";

import Link from "next/link";
import { RefreshCw, Plus, Link2, MousePointerClick, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchLinks } from "@/store/my-links-slice";

export function LinksHeader() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.myLinks.loading);
  const totalCount = useAppSelector((s) => s.myLinks.totalCount);
  const links = useAppSelector((s) => s.myLinks.links);

  const loadedCount = links.length;
  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-lg text-muted-foreground">
          Manage, search, and track all your shortened URLs and QR codes.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchLinks({ page: 1, append: false, force: true }))}
            disabled={loading}
            className="gap-1.5 text-xs h-9 rounded-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/appv1/custom-links">
            <Button
              size="sm"
              className="gap-1.5 text-xs h-9 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Link</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: Link2, label: "Total Links", value: totalCount },
          { icon: MousePointerClick, label: "Total Clicks", value: totalClicks },
          { icon: Calendar, label: "Active Links", value: `${loadedCount} loaded`, span: true },
        ].map(({ icon: Icon, label, value, span }) => (
          <Card
            key={label}
            className={`rounded-none border-border bg-card p-4 shadow-2xs ${span ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-muted-foreground font-medium">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
