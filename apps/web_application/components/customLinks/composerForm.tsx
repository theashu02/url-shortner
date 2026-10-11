"use client";

import { useMemo } from "react";
import { ArrowRight, Crown, Link2, Loader2, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createCustomLink,
  setDestinationUrl,
  setSlug,
} from "@/store/customLinksSlice";

const SLUG_MAX = 32;

const MODE_COPY = {
  link: {
    title: "Shorten a URL",
    submit: "Create short link",
    icon: Link2,
  },
  qr: {
    title: "Generate a QR code",
    submit: "Create QR code",
    icon: QrCode,
  },
  both: {
    title: "Ship a link and a QR together",
    submit: "Create link & QR",
    icon: Sparkles,
  },
} as const;

export function ComposerForm() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.customLinks.mode);
  const destinationUrl = useAppSelector((state) => state.customLinks.destinationUrl);
  const slug = useAppSelector((state) => state.customLinks.slug);
  const status = useAppSelector((state) => state.customLinks.status);
  const error = useAppSelector((state) => state.customLinks.error);

  const loading = status === "loading";
  const copy = MODE_COPY[mode];
  const Icon = copy.icon;

  const host = useMemo(
    () => (typeof window !== "undefined" ? window.location.host : ""),
    [],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    dispatch(createCustomLink());
  };

  return (
    <section aria-label="Link composer" className="overflow-hidden border border-border bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-inkband text-on-inkband">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {copy.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              Live in seconds · analytics on from the first click
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="composer-url" className="text-sm font-semibold text-foreground">
            {mode === "qr" ? "URL to encode" : "Destination URL"}
          </Label>
          <div className="flex items-center gap-2 border border-border bg-background px-3 transition-colors focus-within:border-ember">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              id="composer-url"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="paste your long link here…"
              value={destinationUrl}
              onChange={(event) => dispatch(setDestinationUrl(event.target.value))}
              className="h-11 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {mode !== "qr" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="composer-slug" className="text-sm font-semibold text-foreground">
                Custom back-half
                <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>
              </Label>
              {host && (
                <Badge variant="outline" className="gap-1 rounded-none border-border/80 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground">
                  <Crown className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                  {host}
                </Badge>
              )}
            </div>
            <div className="flex items-center border border-border bg-background transition-colors focus-within:border-ember">
              <span className="shrink-0 border-r border-border/60 bg-muted/30 px-3 py-0 font-mono text-xs text-muted-foreground">
                {host ? `${host}/` : "/"}
              </span>
              <Input
                id="composer-slug"
                type="text"
                autoComplete="off"
                placeholder="my-brand"
                value={slug}
                maxLength={SLUG_MAX}
                onChange={(event) => dispatch(setSlug(event.target.value))}
                className="h-11 flex-1 border-0 bg-transparent px-3 font-mono text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Letters, numbers, hyphens and underscores · max {SLUG_MAX} chars
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || !destinationUrl.trim()}
          className="h-12 w-full gap-2 rounded-none text-sm shadow-sm disabled:opacity-60 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Creating…</span>
            </>
          ) : (
            <>
              <span>{copy.submit}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
