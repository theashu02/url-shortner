"use client";

import { useMemo } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface UtmParametersProps {
  params: UtmParams;
  onChange: (params: UtmParams) => void;
  destinationUrl?: string;
}

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

export function UtmParameters({ params, onChange, destinationUrl = "" }: UtmParametersProps) {
  const query = useMemo(() => buildQuery(params), [params]);

  const base = destinationUrl.trim() || "https://yoursite.com";
  const preview = query ? `${base}${base.includes("?") ? "&" : "?"}${query}` : "";

  const set = (key: keyof UtmParams, value: string) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Add UTMs to track web traffic in analytics tools.{" "}
        <a href="https://support.google.com/analytics/answer/1033863" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Learn more
        </a>.
      </p>

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
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="pl-7 pr-7 h-9 text-xs font-mono rounded-none"
              />
              {params[key] && (
                <button type="button" onClick={() => set(key, "")} aria-label={`Clear ${label}`} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="flex items-start gap-2 p-3 bg-card border border-border/60 text-xs font-mono text-muted-foreground break-all leading-relaxed rounded-none">
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
    </div>
  );
}
