"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Share2,
  Unlink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast-manager";
import { useClipboard } from "@/hooks/useClipboard";
import { useQrDownload } from "@/hooks/useQrDownload";
import { api } from "@/lib/eden";
import { extractApiMessage } from "@/lib/apiError";
import type { PageDTO } from "@/server/services/pages";

interface PageShareDialogProps {
  page: PageDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPageUpdated?: (page: PageDTO) => void;
}

export function PageShareDialog({
  page,
  open,
  onOpenChange,
  onPageUpdated,
}: PageShareDialogProps) {
  const { qrRef, downloadQr } = useQrDownload();
  const [customSlug, setCustomSlug] = useState("");
  const [linkedShortCode, setLinkedShortCode] = useState<string | null>(
    page.linkedShortCode ?? null
  );
  const [busy, setBusy] = useState<"link" | "unlink" | null>(null);
  const publicCopy = useClipboard();
  const shortCopy = useClipboard();

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = origin ? `${origin}/p/${page.slug}` : `/p/${page.slug}`;
  const shortUrl =
    linkedShortCode && origin ? `${origin}/${linkedShortCode}` : null;
  const qrValue = shortUrl ?? publicUrl;
  const published = page.status === "published";

  const copyText = async (key: "public" | "short", text: string) => {
    const ok = await (key === "public" ? publicCopy.copy(text) : shortCopy.copy(text));
    if (!ok) {
      toast.add({
        title: "Copy failed",
        description: "Could not access the clipboard.",
        type: "error",
      });
    }
  };

  const createShortLink = async () => {
    setBusy("link");
    try {
      const res = await api.pages({ id: page._id })["short-link"].post({
        customSlug: customSlug.trim() || undefined,
      });
      if (res.data && "shortCode" in res.data && res.data.shortCode) {
        const data = res.data as unknown as {
          page: PageDTO;
          shortCode: string;
          shortUrl: string;
        };
        setLinkedShortCode(data.shortCode);
        setCustomSlug("");
        onPageUpdated?.(data.page);
        toast.add({
          title: "Short link created",
          description: data.shortUrl,
          type: "success",
        });
        return;
      }
      toast.add({
        title: "Short link failed",
        description: extractApiMessage(res, "Could not create the short link."),
        type: "error",
      });
    } catch (err) {
      toast.add({
        title: "Short link failed",
        description: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    } finally {
      setBusy(null);
    }
  };

  const unlinkShortLink = async () => {
    setBusy("unlink");
    try {
      const res = await api.pages({ id: page._id })["short-link"].delete();
      if (res.data && "page" in res.data && res.data.page) {
        setLinkedShortCode(null);
        onPageUpdated?.(res.data.page as unknown as PageDTO);
        toast.add({
          title: "Short link removed",
          description: "The short URL still resolves, but is unlinked.",
          type: "success",
        });
        return;
      }
      toast.add({
        title: "Remove failed",
        description: extractApiMessage(res, "Could not remove the short link."),
        type: "error",
      });
    } catch (err) {
      toast.add({
        title: "Remove failed",
        description: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    } finally {
      setBusy(null);
    }
  };

  const nativeShare = async () => {
    try {
      const nav = navigator as Navigator & {
        share?: (data: { title?: string; url?: string }) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share({ title: page.title, url: publicUrl });
        return;
      }
      await copyText("public", publicUrl);
    } catch {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border/60 p-5 text-left">
          <DialogTitle className="text-base font-bold">
            Share this page
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            /p/{page.slug}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 p-5">
          {!published && (
            <p className="w-full rounded-none border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-foreground">
              This page is a draft. Publish it before sharing - the public
              URL returns 404 until then.
            </p>
          )}

          <div className="bg-white p-4 shadow-xs ring-1 ring-border">
            <QRCodeSVG
              ref={qrRef}
              value={qrValue}
              size={160}
              level="H"
              marginSize={1}
            />
          </div>
          <p className="max-w-full truncate px-2 text-center font-mono text-[11px] text-muted-foreground">
            {qrValue}
          </p>

          <div className="flex w-full flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyText("public", publicUrl)}
                className="h-9 flex-1 gap-1.5 text-sm"
              >
                {publicCopy.copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {publicCopy.copied ? "Copied" : "Copy page URL"}
              </Button>
              <Button
                variant="outline"
                onClick={nativeShare}
                className="h-9 gap-1.5 text-sm"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Share
              </Button>
            </div>

            <Button
              onClick={() => downloadQr(`qr-page-${page.slug}.png`)}
              className="h-9 w-full gap-2 text-sm"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download QR PNG
            </Button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-none border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Open live page
            </a>
          </div>

          <div className="w-full border-t border-border/60 pt-4">
            <Label className="text-xs font-bold">SimpLx short link</Label>
            {shortUrl ? (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => copyText("short", shortUrl)}
                  className="flex items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate font-mono">{shortUrl}</span>
                  {shortCopy.copied ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3 shrink-0" aria-hidden="true" />
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Clicks on this short URL use the standard link redirect
                  pipeline and are counted there, not as page views.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={unlinkShortLink}
                  disabled={busy !== null}
                  className="gap-1.5 self-start px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Unlink className="h-3.5 w-3.5" aria-hidden="true" />
                  {busy === "unlink" ? "Removing..." : "Unlink short URL"}
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="Custom alias (optional)"
                    className="h-9 flex-1 font-mono text-xs"
                    maxLength={32}
                  />
                  <Button
                    onClick={createShortLink}
                    disabled={busy !== null}
                    className="h-9 gap-1.5 text-sm"
                  >
                    <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {busy === "link" ? "Creating..." : "Create"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Points a short URL at this page. Renaming the page slug
                  updates the destination automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
