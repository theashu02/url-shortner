"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAvatarSrc } from "@/server/lib/pageAvatar";
import { uploadAvatar, validateAvatarLink } from "./avatarUpload";
import { cn } from "@/lib/utils";

interface AvatarFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export function AvatarField({ value, onChange }: AvatarFieldProps) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [link, setLink] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = isAvatarSrc(value) ? value.trim() : "";

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadAvatar(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveLink = () => {
    const invalid = validateAvatarLink(link);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    onChange(link.trim());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Page avatar preview"
            className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="flex gap-1 rounded-none bg-muted p-1" role="tablist" aria-label="Avatar source">
          {(["upload", "link"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => {
                setMode(tab);
                setError(null);
                if (tab === "link") setLink(value);
              }}
              className={cn(
                "rounded-none px-2.5 py-1 text-xs font-semibold capitalize",
                mode === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setLink("");
            }}
            className="ml-auto gap-1 px-2 text-xs text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </Button>
        ) : null}
      </div>
      {mode === "upload" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="w-full gap-1.5"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {busy ? "Uploading…" : "Upload image (max 3MB)"}
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Stored on Cloudinary and resized to 512px. JPEG, PNG or WebP.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="theme-avatar-link" className="sr-only">
            Avatar image link
          </Label>
          <div className="flex gap-1.5">
            <Input
              id="theme-avatar-link"
              value={link}
              placeholder="https://… or /avatar.png"
              onChange={(e) => setLink(e.target.value)}
              className="h-8 font-mono text-xs"
            />
            <Button type="button" size="sm" onClick={saveLink} className="gap-1 px-2.5">
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              Set
            </Button>
          </div>
        </div>
      )}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

