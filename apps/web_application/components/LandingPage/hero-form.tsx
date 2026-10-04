"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { api } from "@/lib/eden";
import { toast } from "@/components/ui/toast";
import { urlRegex } from "@/lib/constant";

export function HeroForm() {
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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
      <div className="w-full bg-card p-2 shadow-hard border-4 border-line">
        <form
          onSubmit={handleShorten}
          className="flex w-full items-center"
          role="search"
          aria-label="Shorten a URL"
        >
          <div className="pl-4 text-foreground">
            <Link2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <Input
            type="url"
            placeholder="Paste your long link here..."
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="URL to shorten"
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none text-foreground font-semibold text-lg md:text-xl h-14 px-4 placeholder:text-muted-foreground placeholder:font-normal rounded-none"
          />
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="h-14 px-8 rounded-none bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
            {loading ? "Shortening" : "Shorten"}
          </Button>
        </form>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-6 py-3 bg-destructive/10 text-destructive rounded-none border-2 border-destructive text-sm font-bold shadow-hard-sm"
        >
          {errorMsg}
        </div>
      )}

      {shortenedUrl && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border-4 border-line p-2 pl-6 rounded-none shadow-hard animate-in fade-in slide-in-from-bottom-4 mt-4">
          <a
            href={shortenedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg font-bold text-foreground hover:text-ember-deep transition-colors truncate max-w-50 sm:max-w-xs flex items-center gap-2"
          >
            {shortenedUrl}
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
          <Button
            type="button"
            onClick={copyToClipboard}
            aria-label={copied ? "Link copied" : "Copy shortened link"}
            className="rounded-none h-12 px-6 gap-2 bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-bold uppercase tracking-wider cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
