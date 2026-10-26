"use client";

import { useEffect, useState } from "react";
import { Link2, Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/eden";
import { extractApiMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";

interface ShortLinkOption {
  shortCode: string;
  url: string;
}

export function LinkShortPicker({
  itemKey,
  itemUrl,
  shortCode,
  onSelect,
}: {
  itemKey: string;
  itemUrl: string;
  shortCode?: string;
  onSelect: (code: string | null) => void;
}) {
  const [mode, setMode] = useState<"create" | "existing">("create");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ShortLinkOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "existing") return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await api.url["my-links"].get({
          query: {
            page: "1",
            limit: "10",
            ...(search.trim().length > 0 ? { search: search.trim() } : {}),
          },
        });
        if (cancelled) return;
        if (res.data && "links" in res.data && Array.isArray(res.data.links)) {
          setOptions(
            (res.data.links as { shortCode?: string; url?: string }[])
              .filter((link) => typeof link.shortCode === "string")
              .map((link) => ({
                shortCode: String(link.shortCode),
                url: String(link.url ?? ""),
              }))
          );
        } else {
          setError(extractApiMessage(res, "Could not load short links."));
        }
      } catch {
        if (!cancelled) setError("Could not load short links. Try again.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mode, search]);

  const handleCreate = async () => {
    if (!/^https?:\/\/\S+$/i.test(itemUrl.trim())) {
      setError("Enter a valid item URL first (http:// or https://).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.url.create.post({ url: itemUrl.trim() });
      if (res.data && "shortCode" in res.data && res.data.shortCode) {
        onSelect(String(res.data.shortCode));
        return;
      }
      setError(extractApiMessage(res, "Could not create a short link."));
    } catch {
      setError("Could not create a short link. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (shortCode) {
    return (
      <div className="flex items-center gap-1.5 rounded-none bg-ember/5 px-2 py-1.5">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-ember" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">
          /{shortCode}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onSelect(null)}
          aria-label="Remove short link"
          className="h-6 w-6"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {(
          [
            { value: "create", label: "New" },
            { value: "existing", label: "Existing" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setMode(tab.value);
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-none px-2 py-1 text-[11px] font-semibold",
              mode === tab.value
                ? "bg-ember/10 text-ember"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {mode === "create" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreate}
          disabled={busy}
          className="w-full gap-1.5 text-[11px]"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-3 w-3" aria-hidden="true" />
          )}
          Shorten this URL
        </Button>
      ) : (
        <>
          <Label htmlFor={`${itemKey}-short-search`} className="sr-only">
            Search short links
          </Label>
          <div className="relative">
            <Search
              className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={`${itemKey}-short-search`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your links..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {busy && options.length === 0 ? (
              <p className="flex items-center gap-1.5 px-1 py-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Loading...
              </p>
            ) : options.length === 0 ? (
              <p className="px-1 py-2 text-[11px] text-muted-foreground">
                No short links found.
              </p>
            ) : (
              options.map((option) => (
                <button
                  key={option.shortCode}
                  type="button"
                  onClick={() => onSelect(option.shortCode)}
                  className="flex w-full flex-col gap-0.5 rounded-none border border-border/60 px-2 py-1.5 text-left hover:border-ember/50"
                >
                  <span className="font-mono text-[11px] font-bold text-ember">
                    /{option.shortCode}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {option.url}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

