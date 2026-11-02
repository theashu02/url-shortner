"use client";

import { useRef, useCallback } from "react";

const EXPORT_SIZE = 512;

export function useQrDownload() {
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQr = useCallback((filename: string) => {
    const svg = qrRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      ctx.drawImage(img, 0, 0, EXPORT_SIZE, EXPORT_SIZE);

      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
    };

    const encoded = btoa(unescape(encodeURIComponent(svgData)));
    img.src = `data:image/svg+xml;base64,${encoded}`;
  }, []);

  return { qrRef, downloadQr } as const;
}
