"use client";

import { memo, useState, useCallback, useRef } from "react";
import {
  ArrowRight,
  Loader2,
  Crown,
  Info,
  Sparkles,
  Wand2,
  Star,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type CreateMode = "link" | "qr" | "both";

interface UrlCreateFormProps {
  mode: CreateMode;
  onSubmit: (url: string, slug: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export const UrlCreateForm = memo(function UrlCreateForm({
  mode,
  onSubmit,
  error,
  loading,
}: UrlCreateFormProps) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const customSlugInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const url = longUrl.trim();
      if (!url || loading) return;

      const formatted = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      // In QR-only mode, custom slug is not used
      await onSubmit(formatted, mode === "qr" ? "" : customSlug.trim());

      setLongUrl("");
      setCustomSlug("");
    },
    [longUrl, customSlug, loading, mode, onSubmit],
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 50));
    },
    [],
  );

  const focusSlugInput = useCallback(() => {
    customSlugInputRef.current?.focus();
  }, []);

  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";

  const getTitle = () => {
    switch (mode) {
      case "qr":
        return "Quick create: QR Code";
      case "both":
        return "Quick create: Short link & QR Code";
      case "link":
      default:
        return "Quick create: Short link";
    }
  };

  const getSubmitText = () => {
    if (loading) return "Creating…";
    switch (mode) {
      case "qr":
        return "Create QR Code";
      case "both":
        return "Create Link & QR";
      case "link":
      default:
        return "Create short link";
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden p-0 ring-0 rounded-none">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] divide-y lg:divide-y-0 lg:divide-x divide-border/60">
        {/* Left Column: Form Controls */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 lg:p-10 space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Header: Title + Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {getTitle()}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span title="Monthly free plan quota">
                  <Info className="h-4 w-4 text-muted-foreground/70 shrink-0 cursor-pointer hover:text-foreground transition-colors" />
                </span>
              </div>
            </div>

            {/* Domain Indicator (Only shown for Short Link and Both modes, NOT in QR-only mode) */}
            {mode !== "qr" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Domain:</span>
                <Badge
                  variant="outline"
                  className="font-medium text-foreground gap-1 px-2.5 py-1 border-border/80 bg-muted/30 rounded-none"
                >
                  <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {host}
                </Badge>
              </div>
            )}

            {/* Destination URL Input */}
            <div className="space-y-2">
              <Label
                htmlFor="longUrl"
                className="text-sm font-semibold text-foreground"
              >
                {mode === "qr"
                  ? "Enter URL to generate QR Code"
                  : "Enter your destination URL"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="longUrl"
                  type="url"
                  required
                  autoFocus
                  placeholder={
                    mode === "qr"
                      ? "https://example.com"
                      : "https://example.com/my-long-url"
                  }
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="h-11 flex-1 bg-background border-input px-3.5 text-sm focus-visible:ring-2 focus-visible:ring-ring rounded-none"
                />
                <Button
                  type="submit"
                  disabled={loading || !longUrl.trim()}
                  className="h-11 px-6 font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-none text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : mode === "qr" ? (
                    <QrCode className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {getSubmitText()}
                </Button>
              </div>
            </div>

            {/* Custom Alias Input (ONLY shown for 'link' and 'both' modes; HIDDEN in 'qr' mode) */}
            {mode !== "qr" && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="customSlug"
                    className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                  >
                    Custom alias{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                </div>
                <div className="flex h-11 border border-input bg-muted/20 overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-shadow rounded-none">
                  <span className="flex items-center px-3.5 border-r border-border bg-muted/50 text-muted-foreground text-xs font-mono select-none shrink-0">
                    {host}/
                  </span>
                  <Input
                    ref={customSlugInputRef}
                    placeholder="my-brand"
                    value={customSlug}
                    onChange={handleSlugChange}
                    className="flex-1 h-full border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0 dark:bg-transparent placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
              </div>
            )}

            {/* Mode description hint */}
            {mode === "both" && (
              <p className="text-sm text-muted-foreground">
                <Sparkles className="inline h-3.5 w-3.5 text-primary mr-1" />
                This will simultaneously generate a trackable short URL and a high-resolution QR code.
              </p>
            )}

            {/* Error message */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 font-medium rounded-none">
                {error}
              </p>
            )}
          </div>
        </form>

        {/* Right Column: 'Simplify your workflow' Feature Card */}
        <div className="bg-linear-to-br from-primary/4 via-muted/30 to-background p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {/* Sparkle Header */}
            <div>
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Simplify your workflow</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {mode === "qr"
                  ? "Generate crisp vector QR codes for print, packaging, and digital displays."
                  : "Explore smarter ways to create, customize, and track your branded links."}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {mode !== "qr" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={focusSlugInput}
                    size="lg"
                    className="w-full justify-start text-sm gap-2 border-border/80 bg-card/80 hover:bg-card shadow-2xs transition-colors rounded-none px-4"
                  >
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span>Personalize a short link</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-sm gap-2 border-border/80 bg-card/80 hover:bg-card shadow-2xs transition-colors rounded-none px-4"
                  >
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Make a unique link for every post</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-sm font-medium gap-2 border-border/80 bg-card/80 hover:bg-card shadow-2xs transition-colors rounded-none px-4"
                  >
                    <QrCode className="h-4 w-4 text-primary" />
                    <span>High-resolution vector QR</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-sm font-medium gap-2 border-border/80 bg-card/80 hover:bg-card shadow-2xs transition-colors rounded-none px-4"
                  >
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Scannable on all smartphone cameras</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full font-semibold text-sm gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-none py-5"
            >
              <Crown className="h-4 w-4 text-amber-300 fill-amber-300" />
              <span>Upgrade to Create with AI</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});
