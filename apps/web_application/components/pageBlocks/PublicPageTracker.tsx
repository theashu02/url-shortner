"use client";

import { useCallback } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { useAppDispatch } from "@/store";
import { trackBlockClick } from "@/store/pages-slice";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageRenderer, type PageRendererProps } from "./PageRenderer";

interface PublicPageTrackerProps
  extends Omit<PageRendererProps, "interactive" | "onLinkClick" | "compact"> {
  pageId: string;
  compact?: boolean;
}

export function PublicPageTracker({
  pageId,
  compact = true,
  ...rendererProps
}: PublicPageTrackerProps) {
  const dispatch = useAppDispatch();
  const { copied, copy } = useClipboard();

  const handleLinkClick = useCallback(
    (blockKey: string) => {
      const referrer =
        typeof document !== "undefined" && document.referrer
          ? document.referrer
          : undefined;
      dispatch(trackBlockClick({ pageId, blockKey, referrer }));
    },
    [dispatch, pageId]
  );

  const copyLink = useCallback(async () => {
    await copy(window.location.href);
  }, [copy]);

  const nativeShare = useCallback(async () => {
    try {
      const nav = navigator as Navigator & {
        share?: (data: { title?: string; url?: string }) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share({
          title: rendererProps.title,
          url: window.location.href,
        });
        return;
      }
      await copyLink();
    } catch {
    }
  }, [copyLink, rendererProps.title]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <PageRenderer
        {...rendererProps}
        compact={compact}
        interactive
        onLinkClick={handleLinkClick}
        className="w-full"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={nativeShare}
          className="gap-1.5"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Share
        </Button>
      </div>
    </div>
  );
}