"use client";

import { useMemo } from "react";
import { Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQrDownload } from "@/hooks/useQrDownload";
import { useAppSelector, useAppDispatch } from "@/store";
import { setQrLink } from "@/store/my-links-slice";

interface QrModalProps {
  onCopy: (id: string, text: string) => void;
}

export function QrModal({ onCopy }: QrModalProps) {
  const dispatch = useAppDispatch();
  const link = useAppSelector((s) => s.myLinks.qrLink);
  const { qrRef, downloadQr } = useQrDownload();

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL),
    [],
  );

  if (!link) return null;

  const shortUrl = `${origin}/${link.shortCode}`;
  const handleClose = () => dispatch(setQrLink(null));

  return (
    <Dialog open={!!link} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm rounded-none border-border shadow-lg p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border/60">
          <DialogTitle className="text-base font-bold text-foreground">
            QR Code Preview
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-mono mt-0.5">
            /{link.shortCode}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="bg-white p-4 shadow-2xs ring-1 ring-border">
            <QRCodeSVG ref={qrRef} value={shortUrl} size={180} level="H" marginSize={1} />
          </div>

          <p className="text-xs text-muted-foreground text-center font-mono truncate max-w-full px-2">
            {link.url}
          </p>

          <div className="w-full pt-2 flex flex-col gap-2">
            <Button
              onClick={() => downloadQr(`qr-${link.shortCode}.png`)}
              className="w-full h-9 text-xs font-semibold gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download High-Res PNG</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onCopy(link._id, shortUrl)}
              className="w-full h-9 text-xs font-medium gap-1.5 rounded-none"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Short URL</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
