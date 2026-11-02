"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailHeaderProps {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  continueRate: number;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
}

export function DetailHeader({
  shortCode,
  originalUrl,
  totalClicks,
  continueRate,
  refreshing,
  onRefresh,
  onBack,
}: DetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable - no visual change.
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1.5 rounded-none px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All links</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 gap-1.5 rounded-none text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 rounded-none text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-ember" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
          </Button>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 bg-inkband px-3 text-xs font-semibold text-on-inkband transition-colors hover:bg-inkband/90"
          >
            <span className="hidden sm:inline">Visit</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="overflow-hidden border border-border bg-card shadow-sm">
        <div className="space-y-2 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            <span className="inline-block h-2 w-2 bg-ember" aria-hidden="true" />
            Link analytics
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="min-w-0 font-mono text-2xl font-extrabold tracking-tight break-all text-foreground sm:text-3xl">
              {shortCode}
            </h1>
            {totalClicks > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1.5 border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-ember opacity-60" />
                  <span className="relative inline-flex h-2 w-2 bg-ember" />
                </span>
                <span className="tabular-nums">{continueRate}% continue-through</span>
              </span>
            )}
          </div>
          <Link
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-w-0 max-w-full items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="truncate">{originalUrl}</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-70 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
