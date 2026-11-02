"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LinkExpirationProps {
  value: string | null;
  onChange: (expiresAt: string | null) => void;
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

export function LinkExpiration({ value, onChange }: LinkExpirationProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setDraft("");
      setError(null);
    }
  }, [value]);

  const apply = (dtLocal: string) => {
    setDraft(dtLocal);
    setError(null);
    if (!dtLocal) { onChange(null); return; }
    const selected = new Date(dtLocal);
    if (selected <= new Date()) { setError("Expiration must be in the future."); onChange(null); return; }
    onChange(selected.toISOString());
  };

  const display = draft ? formatDisplay(draft) : null;
  const isPast = draft ? new Date(draft) <= new Date() : false;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Set an expiration date for this link. The destination will become inaccessible after the specified time.
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Quick presets</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => apply(preset.getValue())}
              className="h-8 text-xs rounded-none px-3"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expires-at" className="text-xs font-medium flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          Custom date and time
        </Label>
        <Input
          id="expires-at"
          type="datetime-local"
          min={toDatetimeLocal(new Date())}
          value={draft}
          onChange={(e) => apply(e.target.value)}
          className="h-9 text-sm rounded-none w-full sm:w-fit"
        />
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {display && !isPast && !error && (
        <div className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-none">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expires on</p>
            <p className="text-sm font-bold font-mono">{display}</p>
          </div>
        </div>
      )}
    </div>
  );
}
