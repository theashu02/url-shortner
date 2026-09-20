"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector, useAppDispatch } from "@/store";
import { setShareLink } from "@/store/my-links-slice";
import { SOCIAL_LOGOS } from "@/lib/socialLogos";
import { useQrDownload } from "@/hooks/useQrDownload";

type ShareMode = "link" | "qr";

export function ShareModal() {
  const dispatch = useAppDispatch();
  const link = useAppSelector((s) => s.myLinks.shareLink);
  const [mode, setMode] = useState<ShareMode>("link");
  const { qrRef, downloadQr } = useQrDownload();

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    [],
  );

  if (!link) return null;

  const shortUrl = `${origin}/${link.shortCode}`;
  const handleClose = () => dispatch(setShareLink(null));

  const encodedUrl = encodeURIComponent(shortUrl);
  const encodedText = encodeURIComponent("Check out this link: ");

  const socialLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      logo: SOCIAL_LOGOS.facebook,
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      logo: SOCIAL_LOGOS.x,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      logo: SOCIAL_LOGOS.linkedin,
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`,
      logo: SOCIAL_LOGOS.whatsapp,
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      logo: SOCIAL_LOGOS.telegram,
    },
    {
      name: "Email",
      url: `mailto:?subject=Check out this link&body=${encodedText}${encodedUrl}`,
      logo: SOCIAL_LOGOS.mail,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    // Could add toast here
  };

  const handleNativeShareQr = async () => {
    if (!navigator.share || !qrRef.current) {
      alert("Native sharing is not supported on this browser/device.");
      return;
    }

    try {
      const svgElement = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();
      
      // Wait for image to load to canvas
      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
          resolve(null);
        };
        img.onerror = reject;
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `qr-${link.shortCode}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "QR Code",
            text: "Check out this QR code!",
          });
        } else {
          alert("Your system doesn't support sharing image files directly.");
        }
      });
    } catch (err) {
      console.error("Error sharing QR code", err);
    }
  };

  return (
    <Dialog open={!!link} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md rounded-none border-border shadow-lg p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border/60">
          <DialogTitle className="text-lg font-bold text-foreground">
            Share Link
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center space-y-6">
          {/* Toggle between Link and QR Code */}
          <div className="flex bg-muted/50 p-1 w-full max-w-60">
            <Button
              variant={mode === "link" ? "default" : "ghost"}
              onClick={() => setMode("link")}
              className="flex-1 h-8 text-xs rounded-none"
            >
              Share Link
            </Button>
            <Button
              variant={mode === "qr" ? "default" : "ghost"}
              onClick={() => setMode("qr")}
              className="flex-1 h-8 text-xs rounded-none"
            >
              Share QR Code
            </Button>
          </div>

          {mode === "link" ? (
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-3 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-3 border border-border/60 hover:bg-muted/50 transition-colors"
                  >
                    {social.logo ? (
                      typeof social.logo === "string" ? (
                        <Image src={social.logo} alt={social.name} width={24} height={24} className="h-6 w-6 object-contain rounded" />
                      ) : (
                        <>
                          {social.logo.light ? (
                            <Image src={social.logo.light} alt={social.name} width={24} height={24} className="h-6 w-6 object-contain dark:hidden" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary dark:hidden">
                              {social.name[0]}
                            </div>
                          )}
                          {social.logo.dark ? (
                            <Image src={social.logo.dark} alt={social.name} width={24} height={24} className="h-6 w-6 object-contain hidden dark:block" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary hidden dark:flex">
                              {social.name[0]}
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {social.name[0]}
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
              <div className="flex gap-2 w-full">
                <Input
                  value={shortUrl}
                  readOnly
                  className="flex-1 bg-muted/30 border border-border/60 text-xs px-3 font-mono outline-none"
                />
                <Button onClick={handleCopyLink} className="rounded-none px-4 h-9 gap-1.5 text-xs">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 shadow-2xs ring-1 ring-border">
                <QRCodeSVG ref={qrRef} value={shortUrl} size={160} level="H" marginSize={1} />
              </div>
              
              <div className="w-full pt-2 flex flex-col gap-2">
                {typeof navigator !== "undefined" && navigator.canShare && (
                  <Button
                    onClick={handleNativeShareQr}
                    className="w-full h-9 text-xs font-semibold gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Share className="h-3.5 w-3.5" />
                    <span>Native Share (Mobile/Mac)</span>
                  </Button>
                )}
                <Button
                  onClick={() => downloadQr(`qr-${link.shortCode}.png`)}
                  variant="outline"
                  className="w-full h-9 text-xs font-medium gap-1.5 rounded-none"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Image</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
