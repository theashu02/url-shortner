"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import { UrlResultCard } from "@/components/appv1/url-result-card";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetComposer } from "@/store/customLinksSlice";
import { fetchLinks } from "@/store/my-links-slice";

export function ComposerResult() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.customLinks.mode);
  const result = useAppSelector((state) => state.customLinks.result);

  const shortUrl = useMemo(
    () =>
      result && typeof window !== "undefined"
        ? `${window.location.origin}/${result.shortCode}`
        : "",
    [result],
  );

  useEffect(() => {
    if (result) {
      dispatch(fetchLinks({ page: 1, append: false, force: true }));
    }
  }, [result, dispatch]);

  if (!result) return null;

  return (
    <section aria-label="Creation result" className="space-y-4">
      <div className="flex items-center gap-3 border border-border bg-card px-5 py-4 shadow-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-ember text-on-ember">
          <PartyPopper className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">
            Your {mode === "qr" ? "QR code" : "short link"} is live
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Tracking clicks from this moment · library refreshed
          </p>
        </div>
        <Link
          href="/appv1/my-links"
          className="group hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-ember sm:inline-flex"
        >
          Open library
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <UrlResultCard
        mode={mode}
        shortUrl={shortUrl}
        shortCode={result.shortCode}
        originalUrl={result.originalUrl}
        onReset={() => dispatch(resetComposer())}
      />
    </section>
  );
}
