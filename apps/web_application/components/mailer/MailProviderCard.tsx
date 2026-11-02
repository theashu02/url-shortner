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
        "group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6",
        connected && "border-border"
      )}
    >
      {/* Top accent line for connected/error/connecting states */}
      <div
        className={cn("absolute inset-x-5 top-0 h-1 rounded-b-full transition-colors", accentBarClass)}
        aria-hidden="true"
      />

      {/* Top section: Icon, Status badge, Title & Description */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-muted [&_svg]:size-6">
            {icon}
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 gap-1.5 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider",
              badgeClass
            )}
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden="true" />
            <span>{statusLabel}</span>
          </Badge>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground uppercase">
            {title}
          </h3>
          <p className="min-h-[3rem] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Connected account metadata pill */}
        {connected && connectedEmail && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
            <Check className="size-4 shrink-0 text-foreground" aria-hidden="true" />
            <span
              className="truncate font-mono text-sm text-foreground select-all"
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
            className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1 leading-relaxed break-words">{error}</span>
          </div>
        )}
      </div>

      {/* Bottom section: Actions and Footer */}
      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
          <Button
            onClick={onPrimary}
            disabled={primaryDisabled}
            variant={connected ? "outline" : "default"}
            size="sm"
            className={cn(
              "h-11 w-full gap-2 rounded-xl text-sm font-semibold",
              !connected && "min-[420px]:col-span-2"
            )}
          >
            {connecting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            <span>{primaryLabel}</span>
          </Button>

          {connected && onTest && (
            <Button
              onClick={onTest}
              disabled={testPending}
              variant="outline"
              size="sm"
              className="h-11 w-full gap-2 rounded-xl text-sm"
            >
              {testPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  <span>Send test</span>
                </>
              )}
            </Button>
          )}

          {connected && onDisconnect && (
            <Button
              onClick={onDisconnect}
              variant="destructive"
              size="sm"
              className="h-11 w-full gap-2 rounded-xl text-sm min-[420px]:col-span-2"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span>Disconnect</span>
            </Button>
          )}
        </div>

        {footer && (
          <div className="border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
