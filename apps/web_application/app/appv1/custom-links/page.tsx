"use client";

import { useState } from "react";
import { Link2, Globe, Check, Copy, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/eden";
import { useFetchApi } from "@/hooks/useFetchApi";

export default function CustomLinksPage() {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, error, loading, execute, reset } = useFetchApi<
    { shortCode: string; originalUrl: string },
    { message: string }
  >();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = longUrl.trim();
    if (!url || loading) return;

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const slug = customSlug.trim();

    const result = await execute(() =>
      api.url.create.post({
        url: formattedUrl,
        ...(slug ? { customSlug: slug } : {}),
      })
    );

    if (result) {
      setLongUrl("");
      setCustomSlug("");
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shortUrl = data ? `${origin}/${data.shortCode}` : "";

  const handleCopy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    reset();
    setLongUrl("");
    setCustomSlug("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Custom short link</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create a branded short link with your own custom alias.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {data ? (
            /* --- SUCCESS STATE --- */
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-sm">Link created!</p>
                  <p className="text-xs text-muted-foreground">Your short link is ready to share.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
                <Link2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-sm font-medium truncate">{shortUrl}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 font-medium"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-primary" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground truncate">
                <span className="font-medium">Destination:</span> {data.originalUrl}
              </p>

              <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={handleReset}>
                Create another link
              </Button>
            </div>
          ) : (
            /* --- FORM STATE --- */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="longUrl" className="text-sm font-medium">
                  Destination URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="longUrl"
                    type="url"
                    required
                    autoFocus
                    placeholder="https://example.com/very-long-url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="pl-9 h-11 rounded-xl bg-muted/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customSlug" className="text-sm font-medium">
                  Custom alias <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex h-11 rounded-xl border border-input bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-shadow">
                  <span className="flex items-center px-3 border-r border-border bg-muted/60 text-muted-foreground text-sm select-none shrink-0">
                    {typeof window !== "undefined" ? window.location.host : "localhost:3000"}/
                  </span>
                  <input
                    id="customSlug"
                    type="text"
                    placeholder="my-brand"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 50))}
                    className="flex-1 h-full px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg">
                  {error}
                </p>
              )}

              <div className="pt-2 border-t border-border">
                <Button
                  type="submit"
                  disabled={loading || !longUrl.trim()}
                  className="w-full h-11 rounded-xl font-medium mt-4"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  {loading ? "Creating…" : "Create link"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Links are active immediately after creation.
        </p>
      </div>
    </div>
  );
}