"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, Copy, Check, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DetailError({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="w-full flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-[50vh] w-full max-w-md flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-start gap-3 border border-destructive/20 bg-destructive/5 p-4 text-left">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Analytics unavailable</p>
            <p className="text-xs text-destructive/80">{error}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full rounded-none" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    </div>
  );
}

export function DetailEmpty({ shortCode }: { shortCode: string }) {
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
    <div className="flex flex-col items-center gap-3 border border-dashed border-border bg-card px-6 py-10 text-center shadow-sm sm:py-12">
      <span className="flex h-12 w-12 items-center justify-center bg-mist text-muted-foreground">
        <MousePointerClick className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">No clicks yet</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">
          Share your short link anywhere. Clicks, locations, and devices will show up here in real time.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-9 gap-1.5 rounded-none text-xs"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-ember" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span>{copied ? "Copied" : "Copy short link"}</span>
      </Button>
    </div>
  );
}
