"use client";

import type { ReactNode } from "react";
import { AlertCircle, Check, Loader2, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MailConnectionStatus } from "./mailer-types";

interface MailProviderCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  status: MailConnectionStatus;
  statusLabel: string;
  connectedEmail?: string | null;
  error?: string | null;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onDisconnect?: () => void;
  onTest?: () => void;
  testPending?: boolean;
  footer?: ReactNode;
}

const STATUS_CONFIG: Record<
  MailConnectionStatus,
  {
    badgeClass: string;
    dotClass: string;
    accentBarClass: string;
  }
> = {
  connected: {
    badgeClass: "border-border bg-lime-soft text-on-lime font-medium",
    dotClass: "bg-current",
    accentBarClass: "bg-ember",
  },
  connecting: {
    badgeClass: "border-border bg-ember text-on-ember font-medium",
    dotClass: "bg-current animate-ping",
    accentBarClass: "bg-ember animate-pulse",
  },
  error: {
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive font-medium",
    dotClass: "bg-destructive",
    accentBarClass: "bg-destructive",
  },
  disconnected: {
    badgeClass: "border-border bg-muted text-muted-foreground font-medium",
    dotClass: "bg-muted-foreground/60",
    accentBarClass: "bg-transparent",
  },
};

export function MailProviderCard({
  icon,
  title,
  description,
  status,
  statusLabel,
  connectedEmail,
  error,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  onDisconnect,
  onTest,
  testPending,
  footer,
}: MailProviderCardProps) {
  const connected = status === "connected";
  const connecting = status === "connecting";
  const { badgeClass, dotClass, accentBarClass } = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-none border border-border bg-card p-4 text-card-foreground transition-colors hover:border-foreground/30",
        connected && "border-border"
      )}
    >
      {/* Top accent line for connected/error/connecting states */}
      <div
        className={cn("absolute inset-x-0 top-0 h-0.5 rounded-none transition-colors", accentBarClass)}
        aria-hidden="true"
      />

      {/* Top section: Icon + Title row with Status badge, and Description below */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border bg-muted/50 text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-muted [&_svg]:size-4">
              {icon}
            </div>
            <h3 className="truncate font-display text-sm font-bold uppercase tracking-wide text-foreground">
              {title}
            </h3>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 gap-1.5 rounded-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              badgeClass
            )}
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden="true" />
            <span>{statusLabel}</span>
          </Badge>
        </div>

        <p className="min-h-9 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Connected account metadata pill */}
        {connected && connectedEmail && (
          <div className="flex items-center gap-2 rounded-none border border-border bg-muted/40 px-2.5 py-1.5 text-xs">
            <Check className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />
            <span
              className="truncate font-mono text-xs text-foreground select-all"
              title={connectedEmail}
            >
              {connectedEmail}
            </span>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-none border border-destructive/25 bg-destructive/10 p-2 text-xs text-destructive"
          >
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1 leading-relaxed wrap-break-word">{error}</span>
          </div>
        )}
      </div>

      {/* Bottom section: Actions and Footer */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            onClick={onPrimary}
            disabled={primaryDisabled}
            variant="default"
            size="lg"
            className={cn(
              "rounded-none gap-1.5",
              !connected ? "col-span-2 w-full" : (!onTest ? "col-span-2 w-full" : "w-full")
            )}
          >
            {connecting && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
            <span>{primaryLabel}</span>
          </Button>

          {connected && onTest && (
            <Button
              onClick={onTest}
              disabled={testPending}
              variant="default"
              size="lg"
              className="w-full rounded-none gap-1.5"
            >
              {testPending ? (
                <>
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="size-3" aria-hidden="true" />
                  <span>Send test</span>
                </>
              )}
            </Button>
          )}

          {connected && onDisconnect && (
            <Button
              onClick={onDisconnect}
              variant="destructive"
              size="lg"
              className="col-span-2 w-full rounded-none gap-1.5"
            >
              <Trash2 className="size-3" aria-hidden="true" />
              <span>Disconnect</span>
            </Button>
          )}
        </div>

        {footer && (
          <div className="border-t border-border/60 pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
