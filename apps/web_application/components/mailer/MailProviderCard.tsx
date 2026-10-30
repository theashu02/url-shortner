"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_STYLES: Record<MailConnectionStatus, string> = {
  connected: "bg-primary/10 text-primary border-transparent",
  connecting: "bg-secondary text-secondary-foreground border-transparent",
  error: "bg-destructive/10 text-destructive border-transparent",
  disconnected: "bg-muted text-muted-foreground border-transparent",
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
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted text-foreground">
            {icon}
          </div>
          <Badge variant="outline" className={cn("shrink-0", STATUS_STYLES[status])}>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === "connected" && "bg-primary",
                status === "connecting" && "animate-pulse bg-secondary-foreground",
                status === "error" && "bg-destructive",
                status === "disconnected" && "bg-muted-foreground",
              )}
              aria-hidden="true"
            />
            {statusLabel}
          </Badge>
        </div>
        <CardTitle className="pt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {connected && connectedEmail ? (
          <p className="truncate text-sm font-medium text-foreground" title={connectedEmail}>
            {connectedEmail}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-xs leading-relaxed text-destructive">
            {error}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button onClick={onPrimary} disabled={primaryDisabled} variant={connected ? "outline" : "default"}>
            {primaryLabel}
          </Button>
          {connected && onTest ? (
            <Button onClick={onTest} disabled={testPending} variant="outline">
              {testPending ? "Sending..." : "Send test"}
            </Button>
          ) : null}
          {connected && onDisconnect ? (
            <Button onClick={onDisconnect} variant="destructive">
              Disconnect
            </Button>
          ) : null}
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}
