"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, ExternalLink, Eye, ShieldCheck } from "lucide-react";
import { collectDeviceInfo, shouldSkipCapture } from "@/lib/device-info";
import { truncateUrl } from "@/lib/constant";

interface DeviceInterstitialProps {
  shortCode: string;
  eventId: string;
  destinationUrl: string;
}

const STEPS = ["Preview", "Continue"] as const;

function CodeTiles({ shortCode }: { shortCode: string }) {
  return (
    <div className="border-border bg-card w-full border-2 p-5 shadow-sm sm:p-8">
      <p className="text-muted-foreground text-[11px] font-bold tracking-[0.2em] uppercase">
        Short code
      </p>
      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
        aria-hidden="true"
      >
        {shortCode.split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="border-border bg-mist text-ember flex h-11 w-8 items-center justify-center border font-mono text-base font-black sm:h-14 sm:w-10 sm:text-xl"
          >
            {char}
          </span>
        ))}
      </div>
      <p className="text-muted-foreground mt-4 truncate text-center font-mono text-xs">
        /{shortCode}
      </p>
    </div>
  );
}

export function DeviceInterstitial({
  shortCode,
  eventId,
  destinationUrl,
}: DeviceInterstitialProps) {
  const postedRef = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (postedRef.current || shouldSkipCapture()) return;
    postedRef.current = true;

    (async () => {
      try {
        const device = await collectDeviceInfo();
        await fetch("/api/device/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, shortCode, device }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        // Analytics must never break the visitor flow.
      }
    })();
  }, [eventId, shortCode]);

  const handleContinue = () => {
    try {
      void fetch("/api/device/continued", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, shortCode }),
        keepalive: true,
      });
    } catch {
      // Navigation proceeds regardless.
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(destinationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; selection still works.
    }
  };

  let host = destinationUrl;
  try {
    host = new URL(destinationUrl).host;
  } catch {
    // Fall back to the raw destination string.
  }

  return (
    <div className="bg-mist font-ubuntu relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-14 sm:px-8">
      <div
        className="border-border bg-lime-soft pointer-events-none absolute -top-10 -right-10 h-40 w-40 border-2"
        aria-hidden="true"
      />
      <div
        className="border-border bg-lake/20 pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 border-2"
        aria-hidden="true"
      />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="border-border bg-card text-foreground inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase shadow-sm">
            <Eye className="text-ember h-3.5 w-3.5" aria-hidden="true" />
            Link preview
          </p>

          <h1 className="text-foreground m-0 p-0 text-5xl font-black tracking-tighter uppercase sm:text-6xl lg:text-7xl">
            Look before <span className="text-ember">you leap</span>
          </h1>

          <ol className="text-muted-foreground flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                {index > 0 && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                <span
                  className={
                    index === 0
                      ? "bg-inkband text-on-inkband px-2 py-1"
                      : "border-border bg-card border px-2 py-1"
                  }
                >
                  0{index + 1} {step}
                </span>
              </li>
            ))}
          </ol>

          <div className="border-border bg-card w-full space-y-2 border-2 p-5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              You are heading to
            </p>
            <p className="text-foreground text-xl font-bold break-all">{host}</p>
            <p
              className="text-muted-foreground font-mono text-xs break-all select-all"
              title={destinationUrl}
            >
              {truncateUrl(destinationUrl, 120)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <a
              href={destinationUrl}
              onClick={handleContinue}
              className="group border-border bg-btn text-on-btn hover:bg-ember hover:text-on-ember inline-flex flex-1 items-center justify-center gap-2 border-2 px-10 py-4 text-sm font-bold tracking-widest uppercase transition-colors"
            >
              Continue
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="border-border bg-card hover:bg-mist inline-flex items-center justify-center gap-2 border-2 px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors"
            >
              {copied ? (
                <Check className="text-ember h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Double-check the address above before continuing.
          </p>
        </div>

        <CodeTiles shortCode={shortCode} />
      </div>
    </div>
  );
}
