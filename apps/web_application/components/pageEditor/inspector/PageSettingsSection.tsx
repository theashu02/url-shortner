"use client";

import { memo, useEffect, useState } from "react";
import { Check, Link2, Loader2, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast-manager";
import { cn } from "@/lib/utils";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import type { UsePageDraft } from "../usePageDraft";

const TITLE_COMMIT_DELAY_MS = 400;
const TITLE_MAX_LENGTH = 120;

function areSettingsEqual(
  prev: { draft: UsePageDraft; className?: string },
  next: { draft: UsePageDraft; className?: string }
): boolean {
  return (
    prev.className === next.className &&
    prev.draft.title === next.draft.title &&
    prev.draft.slug === next.draft.slug &&
    prev.draft.page?._id === next.draft.page?._id
  );
}

export const PageSettingsSection = memo(function PageSettingsSection({
  draft,
  className,
}: {
  draft: UsePageDraft;
  className?: string;
}) {
  const [slugInput, setSlugInput] = useState(draft.slug);
  const [titleInput, setTitleInput] = useState(draft.title);
  const committedTitle = draft.title;
  const commitTitle = draft.setTitle;
  const [committing, setCommitting] = useState(false);
  const availability = useSlugAvailability(slugInput, draft.slug);

  useEffect(() => {
    if (draft.slug) {
      setSlugInput(draft.slug);
    }
  }, [draft.slug]);

  useEffect(() => {
    setTitleInput(committedTitle);
  }, [committedTitle]);

  useEffect(() => {
    if (titleInput === committedTitle) return;
    const timer = setTimeout(
      () => commitTitle(titleInput),
      TITLE_COMMIT_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [titleInput, committedTitle, commitTitle]);

  const titlePending = titleInput !== committedTitle;
  const slugChanged =
    availability.status === "ok" && availability.slug !== draft.slug;
  const canSaveUrl = slugChanged && !committing;

  const handleCommitSlug = async () => {
    if (!canSaveUrl) return;
    setCommitting(true);
    try {
      const result = await draft.commitSlug(availability.slug);
      toast.add({
        title: result.ok ? "URL updated" : "URL not updated",
        description: result.ok
          ? "Your page now lives at /p/" + availability.slug + "."
          : (result.message ?? "Could not update the URL."),
        type: result.ok ? "success" : "error",
      });
    } finally {
      setCommitting(false);
    }
  };

  return (
    <section
      className={cn(
        "space-y-5 rounded-none border border-border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor="editor-title"
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Type className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            Title
          </Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {titleInput.length}/{TITLE_MAX_LENGTH}
          </span>
        </div>
        <Input
          id="editor-title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={() => {
            if (titlePending) commitTitle(titleInput);
          }}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="My page"
          className="rounded-none"
        />
        {titlePending && (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" aria-hidden="true" />
            Edits save automatically.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="editor-slug"
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          Page URL
        </Label>
        <div className="flex items-stretch">
          <span className="flex shrink-0 items-center border border-r-0 border-border bg-muted px-2.5 font-mono text-xs text-muted-foreground">
            /p/
          </span>
          <div className="relative min-w-0 flex-1">
            <Input
              id="editor-slug"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              maxLength={50}
              placeholder="my-page"
              className="rounded-none border-border pr-9 font-mono text-xs"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              {availability.status === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              {availability.status === "ok" && (
                <Check className="h-4 w-4 text-ember" aria-hidden="true" />
              )}
              {availability.status === "error" && (
                <X className="h-4 w-4 text-destructive" aria-hidden="true" />
              )}
            </span>
          </div>
        </div>
        <div className="min-h-4 text-[11px]" role="status">
          {availability.status === "checking" && (
            <p className="text-muted-foreground">Checking availability…</p>
          )}
          {availability.status === "idle" && (
            <p className="text-muted-foreground">Choose a short, memorable URL.</p>
          )}
          {slugChanged && (
            <p className="flex items-center gap-1 text-ember">
              <Check className="h-3 w-3" aria-hidden="true" />
              This URL is available.
            </p>
          )}
          {availability.status === "ok" && !slugChanged && (
            <p className="text-muted-foreground">This is your current URL.</p>
          )}
          {availability.status === "error" && (
            <p className="text-destructive">{availability.message}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleCommitSlug}
          disabled={!canSaveUrl}
          className="h-9 w-full gap-1.5 rounded-none bg-ember text-on-ember hover:bg-ember/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {committing && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {committing ? "Saving…" : slugChanged ? "Save URL" : "URL saved"}
        </Button>
      </div>
    </section>
  );
}, areSettingsEqual);
