"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useShortenUrl } from "@/hooks/useShortenUrl";
import { EASE } from "./motion-variants";

export function HeroForm() {
  const {
    url,
    setUrl,
    loading,
    shortenedUrl,
    errorMsg,
    copied,
    handleShorten,
    copyToClipboard,
  } = useShortenUrl();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
      <div className="w-full bg-card p-2 border border-border rounded-none shadow-sm">
        <form
          onSubmit={handleShorten}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          role="search"
          aria-label="Shorten a URL"
        >
          <div className="flex flex-1 items-center">
            <div className="pl-4 text-muted-foreground">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              type="url"
              placeholder="Paste your long link here..."
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="URL to shorten"
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none text-foreground text-base md:text-lg h-12 px-4 placeholder:text-muted-foreground rounded-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="h-12 px-6 rounded-none bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-semibold text-sm transition-colors cursor-pointer w-full sm:w-auto"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
            {loading ? "Shortening" : "Shorten"}
          </Button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {errorMsg && (
          <motion.div
            key="form-error"
            role="alert"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="px-5 py-2.5 bg-destructive/10 text-destructive rounded-none border border-destructive text-sm font-medium"
          >
            {errorMsg}
          </motion.div>
        )}

        {shortenedUrl && (
          <motion.div
            key="form-result"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col sm:flex-row items-center gap-3 bg-card border border-border p-2 pl-5 rounded-none shadow-sm mt-2"
          >
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-base font-semibold text-foreground hover:text-ember-deep transition-colors truncate max-w-50 sm:max-w-xs flex items-center gap-2"
            >
              {shortenedUrl}
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
            <Button
              type="button"
              onClick={copyToClipboard}
              aria-label={copied ? "Link copied" : "Copy shortened link"}
              className="rounded-none h-10 px-5 gap-2 bg-btn text-on-btn hover:bg-ember hover:text-on-ember font-semibold text-sm cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
