"use client";

import { Copy, Download, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useQrDownload } from "@/hooks/useQrDownload";
import type { LinkItem } from "./types";

interface QrModalProps {
  link: LinkItem;
  origin: string;
  onClose: () => void;
  onCopy: (id: string, text: string) => void;
}

export function QrModal({ link, origin, onClose, onCopy }: QrModalProps) {
  const { qrRef, downloadQr } = useQrDownload();
  const shortUrl = `${origin}/${link.shortCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <Card className="w-full max-w-sm rounded-none border-border bg-card shadow-lg p-0">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">QR Code Preview</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                /{link.shortCode}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <div className="bg-white p-4 shadow-2xs ring-1 ring-border">
            <QRCodeSVG ref={qrRef} value={shortUrl} size={180} level="H" marginSize={1} />
          </div>

          <p className="text-xs text-muted-foreground text-center font-mono truncate max-w-full px-2">
            {link.url}
          </p>

          <div className="w-full pt-2 flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => downloadQr(`qr-${link.shortCode}.png`)}
              className="w-full h-9 text-xs font-semibold gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download High-Res PNG</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onCopy(link._id, shortUrl)}
              className="w-full h-9 text-xs font-medium gap-1.5 rounded-none"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Short URL</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
