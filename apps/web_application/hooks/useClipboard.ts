"use client";

import { useState, useCallback, useRef } from "react";

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Clear any existing timer to avoid stale resets
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );

  return { copied, copy } as const;
}
