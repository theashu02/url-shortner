"use client";

import { memo } from "react";
import {
  Link2,
  Check,
  Copy,
  Download,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useClipboard } from "@/hooks/useClipboard";
import { useQrDownload } from "@/hooks/useQrDownload";
import type { CreateMode } from "./url-create-form";

interface UrlResultCardProps {
  mode: CreateMode;
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  onReset: () => void;
}

export const UrlResultCard = memo(function UrlResultCard({
  mode,
  shortUrl,
  shortCode,
  originalUrl,
  onReset,
}: UrlResultCardProps) {
  const { copied, copy } = useClipboard();
  const { qrRef, downloadQr } = useQrDownload();

  const getHeaderTitle = () => {
    switch (mode) {
      case "qr":
        return "QR Code Ready!";
      case "both":
        return "Link & QR Code Ready!";
      case "link":
      default:
        return "Short link created!";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "qr":
        return "Your QR code is ready to download and scan.";
      case "both":
        return "Your short link and QR code are ready to share and track.";
      case "link":
      default:
        return "Your short URL is live and tracking analytics immediately.";
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden p-0 ring-0 rounded-none">
      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
        {/* Success Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Check className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-xl text-foreground">
                  {getHeaderTitle()}
                </h2>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold rounded-none"
                >
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getSubtitle()}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="self-start sm:self-auto text-sm font-medium h-10 px-5 rounded-none"
          >
            {mode === "qr" ? "Create another QR code" : "Create another link"}
          </Button>
        </div>

        {/* Content Layout Based on Mode */}
        {mode === "link" && (
          /* Short Link ONLY */
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your shortened URL
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-border bg-muted/30 p-2 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-2 flex-1 min-w-0 py-1">
                  <Link2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-base font-semibold text-foreground truncate select-all">
                    {shortUrl}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copy(shortUrl)}
                    className="flex-1 sm:flex-initial h-10 px-4 text-sm font-medium gap-2 rounded-none"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-primary font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4 text-sm font-medium gap-1.5 rounded-none"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Visit</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-border/60 bg-muted/10 p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination URL
              </span>
              <p className="text-sm text-foreground font-mono truncate select-all">
                {originalUrl}
              </p>
            </div>
          </div>
        )}

        {mode === "qr" && (
          /* QR Code ONLY */
          <div className="flex flex-col md:flex-row items-center gap-8 border border-border bg-muted/20 p-6 sm:p-8">
            <div className="bg-white p-4 shadow-xs ring-1 ring-border shrink-0">
              <QRCodeSVG
                ref={qrRef}
                value={shortUrl || originalUrl}
                size={200}
                level="H"
                marginSize={1}
              />
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Destination
                </span>
                <p className="text-sm text-foreground font-mono truncate select-all mt-1">
                  {originalUrl}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="default"
                  className="h-11 px-6 text-sm font-semibold gap-2 rounded-none w-full sm:w-auto"
                  onClick={() => downloadQr(`qr-${shortCode || "code"}.png`)}
                >
                  <Download className="h-4 w-4" />
                  <span>Download High-Res PNG</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === "both" && (
          /* BOTH Short Link & QR Code */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
            {/* Left: Short Link Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your shortened URL
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-border bg-muted/30 p-2 sm:px-4 sm:py-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0 py-1">
                    <Link2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-base font-semibold text-foreground truncate select-all">
                      {shortUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copy(shortUrl)}
                      className="flex-1 sm:flex-initial h-10 px-4 text-sm font-medium gap-2 rounded-none"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-primary font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4 text-sm font-medium gap-1.5 rounded-none"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Visit</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-border/60 bg-muted/10 p-4 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination URL
                </span>
                <p className="text-sm text-foreground font-mono truncate select-all">
                  {originalUrl}
                </p>
              </div>
            </div>

            {/* Right: QR Code Box */}
            <div className="flex flex-col items-center justify-between border border-border bg-muted/20 p-5 space-y-4">
              <div className="flex items-center gap-2 self-start">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  QR Code
                </span>
              </div>

              <div className="bg-white p-3 shadow-xs ring-1 ring-border">
                <QRCodeSVG
                  ref={qrRef}
                  value={shortUrl}
                  size={150}
                  level="H"
                  marginSize={1}
                />
              </div>

              <Button
                type="button"
                variant="default"
                className="w-full h-10 px-4 text-xs font-semibold gap-2 rounded-none"
                onClick={() => downloadQr(`qr-${shortCode}.png`)}
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});
