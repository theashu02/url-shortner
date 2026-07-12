"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Zap } from "lucide-react";

export function Hero() {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState(false);

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      setShortened(true);
      setTimeout(() => setShortened(false), 3000); // Reset for demo
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Blurred Background Elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20 dark:opacity-10 blur-[130px] pointer-events-none flex">
        <div className="w-1/3 h-full bg-cyan-500 rounded-full" />
        <div className="w-1/3 h-full bg-purple-500 rounded-full -translate-x-1/4" />
        <div className="w-1/3 h-full bg-pink-500 rounded-full -translate-x-2/4" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-8 border border-primary/20 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-none">
          <Zap className="mr-1 h-3.5 w-3.5 text-primary animate-pulse" />
          Powered by sub-millisecond edge routing.
        </Badge>

        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Short Links, <br className="hidden md:block" /> <span className="text-primary">Big Impact.</span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-10 leading-relaxed font-sans">
          Enterprise-grade URL shortening with sub-millisecond redirection, advanced analytics, and custom domains. Built for speed.
        </p>

        {/* URL Shortener Form */}
        <div className="w-full max-w-2xl relative z-10">
          <div className="p-2 bg-card/60 backdrop-blur-xl border border-border/45 shadow-lg rounded-none">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                  <Link2 className="h-5 w-5" />
                </div>
                <Input
                  type="url"
                  placeholder="Paste your long link here..."
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 shadow-none text-base rounded-none transition-all text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="h-14 px-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs uppercase tracking-wider rounded-none transition-colors"
              >
                {shortened ? "Shortened!" : "Shorten"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
