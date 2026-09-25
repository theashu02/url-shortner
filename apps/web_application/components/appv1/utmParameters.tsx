"use client";

import { useState, useCallback, useMemo } from "react";
import { Code2, Crown, Plus, X, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface UtmParametersProps {
  destinationUrl?: string;
  onChange?: (params: UtmParams | null) => void;
}

const EMPTY: UtmParams = { source: "", medium: "", campaign: "", term: "", content: "" };

const FIELDS: { key: keyof UtmParams; label: string; placeholder: string; required?: boolean }[] = [
  { key: "source",   label: "Source",   placeholder: "facebook, google, newsletter", required: true },
  { key: "medium",   label: "Medium",   placeholder: "social, email, cpc" },
  { key: "campaign", label: "Campaign", placeholder: "summer_sale, launch" },
  { key: "term",     label: "Term",     placeholder: "running+shoes" },
  { key: "content",  label: "Content",  placeholder: "logolink, textlink" },
];

function buildQuery(p: UtmParams) {
  return Object.entries({ utm_source: p.source, utm_medium: p.medium, utm_campaign: p.campaign, utm_term: p.term, utm_content: p.content })
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
    .join("&");
}

export function UtmParameters({ destinationUrl = "", onChange }: UtmParametersProps) {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState<UtmParams>(EMPTY);

  const toggle = useCallback((checked: boolean) => {
    setEnabled(checked);
    if (!checked) { setParams(EMPTY); onChange?.(null); }
  }, [onChange]);

  const set = useCallback((key: keyof UtmParams, value: string) => {
    setParams(prev => { const next = { ...prev, [key]: value }; onChange?.(next); return next; });
  }, [onChange]);

  const query = useMemo(() => buildQuery(params), [params]);

  const base = destinationUrl.trim() || "https://yoursite.com";
  const preview = query ? `${base}${base.includes("?") ? "&" : "?"}${query}` : "";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">UTM parameters</span>
          <Badge variant="outline" className="px-1.5 py-0 h-5 gap-1 text-[10px] border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-none">
            <Crown className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            Pro
          </Badge>
        </div>
        <Switch id="utm-toggle" checked={enabled} onCheckedChange={toggle} />
      </div>

      <p className="text-xs text-muted-foreground">
        Add UTMs to track web traffic in analytics tools.{" "}
        <a href="https://support.google.com/analytics/answer/1033863" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Learn more
        </a>.
      </p>

      {enabled && (
        <>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map(({ key, label, placeholder, required }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`utm-${key}`} className="text-xs font-medium flex items-center gap-1">
                  {label}
                  {required && <span className="text-destructive">*</span>}
                  <span className="font-mono text-[10px] text-muted-foreground">(utm_{key})</span>
                </Label>
                <div className="relative">
                  <Plus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50 pointer-events-none" />
                  <Input
                    id={`utm-${key}`}
                    value={params[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="pl-7 pr-7 h-9 text-xs font-mono rounded-none"
                  />
                  {params[key] && (
                    <button type="button" onClick={() => set(key, "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          {preview && (
            <div className="flex items-start gap-2 p-3 bg-muted/40 border border-border/60 text-xs font-mono text-muted-foreground break-all leading-relaxed rounded-none">
              <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
              <span>
                <span className="text-foreground">{base}</span>
                <span className="text-muted-foreground/50">{base.includes("?") ? "&" : "?"}</span>
                {query.split("&").map((part, i) => {
                  const [k, v] = part.split("=");
                  return (
                    <span key={i}>
                      {i > 0 && <span className="text-muted-foreground/40">&amp;</span>}
                      <span className="text-primary">{k}</span>
                      <span className="text-muted-foreground/40">=</span>
                      <span className="text-foreground">{decodeURIComponent(v ?? "")}</span>
                    </span>
                  );
                })}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
