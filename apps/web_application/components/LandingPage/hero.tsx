"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { api } from "@/lib/eden";
import { toast } from "@/components/ui/toast";
import { urlRegex } from "@/lib/constant";

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!urlRegex.test(url.trim())) {
      toast.add({
        type: "error",
        description: "Please enter a valid URL!",
      });
      return;
    }

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
      } else if (res.data && "shortCode" in res.data) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        setShortenedUrl(`${origin}/${res.data.shortCode}`);
        setUrl("");
        toast.add({
          type: "success",
          description: "Link Shortened Successfully!",
        });
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
    <section className="relative w-full min-h-screen bg-mist flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">

      <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">

        {/* Massive Typography */}
        <div className="flex flex-col items-center justify-center text-foreground mb-12 select-none">
          <h1 className="font-display font-bold text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[140px] leading-[0.8] m-0 p-0 drop-shadow-sm">
            SHORT
          </h1>
          <h1 className="font-display font-bold text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[140px] leading-[0.8] m-0 p-0 drop-shadow-sm flex gap-[2vw]">
            <span>LINKS</span> <span className="text-ember">BIG</span>
          </h1>
          <h1 className="font-display font-bold text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[140px] leading-[0.8] m-0 p-0 drop-shadow-sm text-lake">
            IMPACT
          </h1>
        </div>

        {/* Action Area */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
          
          <div className="w-full bg-card p-2 shadow-hard border-4 border-line">
            <form onSubmit={handleShorten} className="flex w-full items-center">
              <div className="pl-4 text-foreground">
                <Link2 className="h-6 w-6" />
              </div>
              <Input
                type="text"
                placeholder="Paste your long link here..."
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none text-foreground font-semibold text-lg md:text-xl h-14 px-4 placeholder:text-muted-foreground placeholder:font-normal rounded-none"
              />
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-14 px-8 rounded-none bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? "Shortening" : "Shorten"}
              </Button>
            </form>
          </div>

          {errorMsg && (
            <div className="px-6 py-3 bg-destructive/10 text-destructive rounded-none border-2 border-destructive text-sm font-bold shadow-hard-sm">
              {errorMsg}
            </div>
          )}

          {shortenedUrl && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border-4 border-line p-2 pl-6 rounded-none shadow-hard animate-in fade-in slide-in-from-bottom-4 mt-4">
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-lg font-bold text-foreground hover:text-ember-deep transition-colors truncate max-w-50 sm:max-w-xs flex items-center gap-2"
              >
                {shortenedUrl}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
              <Button
                type="button"
                onClick={copyToClipboard}
                className="rounded-none h-12 px-6 gap-2 bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-bold uppercase tracking-wider cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Geometric bottom elements */}
      <div className="absolute bottom-0 left-0 w-full h-30 pointer-events-none overflow-hidden z-0 flex">
        <div className="w-1/3 h-full bg-ember border-t-8 border-r-8 border-line transform translate-y-1/2" />
        <div className="w-1/3 h-full bg-lime-soft border-t-8 border-r-8 border-line transform translate-y-1/4" />
        <div className="w-1/3 h-full bg-lake border-t-8 border-line transform translate-y-1/3" />
      </div>
    </section>
  );
}
