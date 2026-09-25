"use client";

import { useState, useCallback } from "react";
import { Clock, Crown, Calendar, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LinkExpirationProps {
  onChange?: (expiresAt: string | null) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

function toDatetimeLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addTime(hours = 0, days = 0) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  d.setDate(d.getDate() + days);
  return toDatetimeLocal(d);
}

const PRESETS = [
  { label: "1 Hour",   getValue: () => addTime(1) },
  { label: "24 Hours", getValue: () => addTime(24) },
  { label: "7 Days",   getValue: () => addTime(0, 7) },
  { label: "30 Days",  getValue: () => addTime(0, 30) },
];

function formatDisplay(dtLocal: string) {
  const d = new Date(dtLocal);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export function LinkExpiration({ onChange }: LinkExpirationProps) {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback((checked: boolean) => {
    setEnabled(checked);
    if (!checked) { setValue(""); setError(null); onChange?.(null); }
  }, [onChange]);

  const apply = useCallback((dtLocal: string) => {
    setValue(dtLocal);
    setError(null);
    if (!dtLocal) { onChange?.(null); return; }
    const selected = new Date(dtLocal);
    if (selected <= new Date()) { setError("Expiration must be in the future."); onChange?.(null); return; }
    onChange?.(selected.toISOString());
  }, [onChange]);

  const display = value ? formatDisplay(value) : null;
  const isPast = value ? new Date(value) <= new Date() : false;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Link expiration</span>
          <Badge variant="outline" className="px-1.5 py-0 h-5 gap-1 text-[10px] border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-none">
            <Crown className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            Pro
          </Badge>
        </div>
        <Switch id="expiry-toggle" checked={enabled} onCheckedChange={toggle} />
      </div>

      <p className="text-xs text-muted-foreground">
        Set an expiration date for this link. The destination will become inaccessible after the specified time.
      </p>

      {enabled && (
        <>
          <Separator />

          {/* Quick presets */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Quick presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => apply(p.getValue())}
                  className="h-8 text-xs rounded-none px-3"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom date/time */}
          <div className="space-y-1.5">
            <Label htmlFor="expires-at" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Custom date &amp; time
            </Label>
            <Input
              id="expires-at"
              type="datetime-local"
              min={toDatetimeLocal(new Date())}
              value={value}
              onChange={e => apply(e.target.value)}
              className="h-9 text-sm rounded-none w-full sm:w-fit"
            />
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Expiry preview */}
          {display && !isPast && !error && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border/60 rounded-none">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expires on</p>
                <p className="text-sm font-bold font-mono">{display}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
