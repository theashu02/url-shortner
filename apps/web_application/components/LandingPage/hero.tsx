"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Zap, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/eden";

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setShortenedUrl("");

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const res = await api.url.create.post({ url: formattedUrl });
      if (res.error) {
        const errObj = res.error.value as { message?: string };
        setErrorMsg(errObj?.message || "Failed to shorten URL. Try again.");
      } else if (res.data?.shortCode) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setShortenedUrl(`${origin}/${res.data.shortCode}`);
        setUrl("");
      }
    } catch (err) {
      console.error("Hero shorten error:", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortenedUrl) return;
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Blurred Background Elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-200 h-100 opacity-20 dark:opacity-10 blur-[130px] pointer-events-none flex">
        <div className="w-1/3 h-full bg-primary rounded-full" />
        <div className="w-1/3 h-full bg-secondary rounded-full -translate-x-1/4" />
        <div className="w-1/3 h-full bg-accent rounded-full -translate-x-2/4" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-8 border border-primary/20 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-none">
          <Zap className="mr-1 h-3.5 w-3.5 text-primary animate-pulse" />
          Powered by sub-millisecond edge routing.
        </Badge>

        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Short Links, <br className="hidden md:block" /> <span className="text-primary">Big Impact.</span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
          Enterprise-grade URL shortening with sub-millisecond redirection, advanced analytics, and custom domains. Built for speed.
        </p>

        {/* URL Shortener Form */}
        <div className="w-full max-w-2xl relative z-10 space-y-4">
          <div className="p-2 bg-card/60 backdrop-blur-xl border border-border/45 shadow-lg rounded-none">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                  <Link2 className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Paste your long link here..."
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 shadow-none text-base rounded-none transition-all text-foreground"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-14 px-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs uppercase tracking-wider rounded-none transition-colors gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Shortening..." : "Shorten"}
              </Button>
            </form>
          </div>

          {/* Shortened URL Result */}
          {shortenedUrl && (
            <div className="p-4 bg-card/80 backdrop-blur-xl border border-primary/30 shadow-md text-left flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1 overflow-hidden w-full">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Successfully Shortened!
                </span>
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                >
                  {shortenedUrl}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                </a>
              </div>
              <Button
                type="button"
                onClick={copyToClipboard}
                variant="outline"
                className="shrink-0 h-10 px-4 gap-2 text-xs font-semibold uppercase tracking-wider border-primary/30 hover:bg-primary/10 rounded-none w-full sm:w-auto"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
