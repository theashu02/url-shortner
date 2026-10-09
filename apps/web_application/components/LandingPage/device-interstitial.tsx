"use client";

import { useEffect, useRef } from "react";
import { collectDeviceInfo, shouldSkipCapture } from "@/lib/device-info";
import { truncateUrl } from "@/lib/constant";

interface DeviceInterstitialProps {
  shortCode: string;
  eventId: string;
  destinationUrl: string;
}

export function DeviceInterstitial({
  shortCode,
  eventId,
  destinationUrl,
}: DeviceInterstitialProps) {
  const postedRef = useRef(false);

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

  let host = destinationUrl;
  try {
    host = new URL(destinationUrl).host;
  } catch {
    // Fall back to the raw destination string.
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mist overflow-hidden px-6 md:px-16 relative font-ubuntu">
      <div className="max-w-350 w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex flex-col items-start gap-8 z-20 shrink-0 mt-20 md:mt-0 max-w-full">
          <h1
            className="text-foreground font-black uppercase leading-[0.8] tracking-tighter m-0 p-0"
            style={{ fontSize: "clamp(64px, 10vw, 180px)" }}
          >
            LOOK
            <br />
            BEFORE
            <br />
            YOU LEAP
          </h1>

          <div className="w-full max-w-xl ml-2 md:ml-4 space-y-5">
            <div className="bg-card border-2 border-line p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                You&apos;re heading to
              </p>
              <p className="text-xl font-bold text-foreground break-all">
                {host}
              </p>
              <p
                className="font-mono text-xs text-muted-foreground break-all"
                title={destinationUrl}
              >
                {truncateUrl(destinationUrl, 120)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={destinationUrl}
                onClick={handleContinue}
                className="inline-block text-center bg-btn hover:bg-ember text-on-btn hover:text-on-ember font-bold tracking-widest uppercase px-10 py-4 text-sm border-2 border-line"
              >
                Continue
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The link owner records basic device info (browser, OS, screen
                size) for analytics when this page loads. Do Not Track is
                respected. Only continue if you trust this destination.
              </p>
            </div>
          </div>
        </div>

        <div
          className="relative flex-1 hidden md:flex items-center justify-center min-h-175 w-full"
          aria-hidden="true"
        >
          <div
            className="text-ember/30 font-black leading-none select-none tracking-tighter break-all text-center"
            style={{ fontSize: "clamp(120px, 18vw, 400px)" }}
          >
            <span>{shortCode.slice(0, 12)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
