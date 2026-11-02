"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/eden";
import { normalizePageSlug, validatePageSlug } from "@/server/lib/pages";

export type SlugAvailability =
  | { status: "idle"; slug: string }
  | { status: "checking"; slug: string }
  | { status: "ok"; slug: string }
  | { status: "error"; slug: string; message: string };

type RemoteResult = { ok: boolean; message?: string };

export function useSlugAvailability(
  raw: string,
  allowSameAs?: string
): SlugAvailability {
  const normalized = normalizePageSlug(raw);
  const syncError =
    normalized.length === 0 ? null : validatePageSlug(normalized);
  const sameAsCurrent =
    allowSameAs !== undefined &&
    normalized.length > 0 &&
    normalized === normalizePageSlug(allowSameAs);
  const [remote, setRemote] = useState<Record<string, RemoteResult>>({});

  useEffect(() => {
    if (normalized.length === 0 || syncError !== null || sameAsCurrent) return;
    if (remote[normalized] !== undefined) return;
    const timer = setTimeout(async () => {
      try {
        const res = await api.pages["check-slug"].post({ slug: normalized });
        if (res.data && "available" in res.data) {
          const message =
            "message" in res.data && typeof res.data.message === "string"
              ? res.data.message
              : undefined;
          setRemote((current) => ({
            ...current,
            [normalized]: res.data.available
              ? { ok: true }
              : { ok: false, message: message ?? "This URL is already taken." },
          }));
        } else {
          setRemote((current) => ({
            ...current,
            [normalized]: { ok: false, message: "Could not check this URL." },
          }));
        }
      } catch {
        setRemote((current) => ({
          ...current,
          [normalized]: {
            ok: false,
            message: "Could not check this URL. Try again.",
          },
        }));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [normalized, syncError, sameAsCurrent, remote]);

  if (normalized.length === 0) return { status: "idle", slug: normalized };
  if (syncError !== null)
    return { status: "error", slug: normalized, message: syncError };
  if (sameAsCurrent) return { status: "ok", slug: normalized };
  const cached = remote[normalized];
  if (!cached) return { status: "checking", slug: normalized };
  if (cached.ok) return { status: "ok", slug: normalized };
  return {
    status: "error",
    slug: normalized,
    message: cached.message ?? "This URL is already taken.",
  };
}
