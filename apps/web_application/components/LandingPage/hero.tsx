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
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-40 blur-[100px] pointer-events-none flex">
        <div className="w-1/3 h-full bg-[#e0f2fe] rounded-full mix-blend-multiply" />
        <div className="w-1/3 h-full bg-[#eac2ff] rounded-full mix-blend-multiply -translate-x-1/4" />
        <div className="w-1/3 h-full bg-[#4a044e] opacity-20 rounded-full mix-blend-multiply -translate-x-2/4" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center text-center">
        <Badge variant="secondary" className="mb-8 border-[#eac2ff] bg-white/50 text-[#4a044e] font-medium tracking-wide">
          <Zap className="mr-1 h-3 w-3 text-[#4a044e]" />
          Powered by sub-millisecond edge routing.
        </Badge>

        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tighter text-[#4a044e] mb-6">
          Short Links, <br className="hidden md:block" /> Big Impact.
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed font-sans">
          Enterprise-grade URL shortening with sub-millisecond redirection, advanced analytics, and custom domains. Built for speed.
        </p>

        {/* URL Shortener Form */}
        <div className="w-full max-w-2xl relative z-10">
          <div className="p-2 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-zinc-200/50">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <Input
                  type="url"
                  placeholder="Paste your long link here..."
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 bg-white/50 border-0 focus-visible:ring-1 focus-visible:ring-[#4a044e]/30 shadow-none text-base rounded-xl transition-all"
                />
              </div>
              <Button
                type="submit"
                className="h-14 px-8 shrink-0 bg-[#4a044e] text-white hover:bg-[#4a044e]/90 font-medium text-base transition-colors"
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
