"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  EyeOff,
  Globe,
  Loader2,
  Settings2,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast-manager";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearLiveSnapshot, fetchLiveSnapshot } from "@/store/pages-slice";
import { pageDraftMatchesSnapshot } from "@/server/lib/pages";
import type { UsePageDraft } from "./usePageDraft";
import { PageShareDialog } from "@/components/pages/pageShareDialog";
import { PageSettingsDialog } from "./PageSettingsDialog";

function areHeaderPropsEqual(
  prev: { draft: UsePageDraft },
  next: { draft: UsePageDraft }
): boolean {
  return (
    prev.draft.page?._id === next.draft.page?._id &&
    prev.draft.page?.status === next.draft.page?.status &&
    prev.draft.title === next.draft.title &&
    prev.draft.slug === next.draft.slug &&
    prev.draft.phase === next.draft.phase &&
    prev.draft.dirty === next.draft.dirty &&
    prev.draft.statusMessage === next.draft.statusMessage &&
    prev.draft.lastSavedAt?.getTime() === next.draft.lastSavedAt?.getTime()
  );
}

export const EditorHeader = memo(function EditorHeader({ draft }: { draft: UsePageDraft }) {
  const dispatch = useAppDispatch();
  const liveSnapshot = useAppSelector((state) => state.pages.liveSnapshot);
  const [busy, setBusy] = useState<"publish" | "unpublish" | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pageId = draft.page?._id;
  const pageStatus = draft.page?.status;
  const published = pageStatus === "published";

  useEffect(() => {
    if (!pageId || pageStatus !== "published") {
      dispatch(clearLiveSnapshot());
      return;
    }
    dispatch(fetchLiveSnapshot(pageId));
  }, [dispatch, pageId, pageStatus]);

  const hasUnpublishedChanges =
    published &&
    liveSnapshot !== null &&
    draft.page !== null &&
    !pageDraftMatchesSnapshot(draft.page, liveSnapshot);
  const canPublish =
    !published &&
    !busy &&
    !draft.dirty &&
    draft.phase !== "saving" &&
    draft.phase !== "loading";

  const savedLabel = draft.lastSavedAt
    ? `Saved ${draft.lastSavedAt.toLocaleTimeString()}`
    : "Not saved yet";

  const runAction = async (action: "publish" | "unpublish") => {
    const wasPublished = draft.page?.status === "published";
    setBusy(action);
    try {
      const result =
        action === "publish" ? await draft.publish() : await draft.unpublish();
      if (result.ok && action === "publish" && wasPublished && draft.page?._id) {
        await dispatch(fetchLiveSnapshot(draft.page._id)).unwrap().catch(() => undefined);
      }
      toast.add({
        title:
          action === "publish" ? "Publish page" : "Unpublish page",
        description: result.ok
          ? action === "publish"
            ? `Your page is live at /p/${draft.slug}.`
            : "The public page is hidden. Your draft is kept."
          : (result.message ?? "Something went wrong. Try again."),
        type: result.ok ? "success" : "error",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card px-4 py-3 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/appv1/pages" />}
        className="gap-1.5 px-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Pages
      </Button>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
        {draft.title || "Untitled page"}
      </span>
      <Badge variant={published ? "default" : "secondary"}>
        {published ? "Published" : "Draft"}
      </Badge>
      {hasUnpublishedChanges && (
        <Badge variant="outline" className="border-ember/40 bg-ember/10 text-ember">
          Unpublished changes
        </Badge>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-[11px] font-medium",
          draft.phase === "error"
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-border bg-muted text-muted-foreground"
        )}
        role="status"
      >
        {draft.phase === "saving" ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Savingâ€¦
          </>
        ) : draft.phase === "error" && draft.statusMessage ? (
          <span className="max-w-56 truncate" title={draft.statusMessage}>
            {draft.statusMessage}
          </span>
        ) : draft.dirty ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            Unsaved changes
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
            {savedLabel}
          </>
        )}
      </span>
      {draft.page && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="gap-1.5"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/appv1/pages/${draft.page._id}/analytics`} />}
            className="gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Stats
          </Button>
        </>
      )}
      {published && (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/p/${draft.slug}`} target="_blank" />}
          className="gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          View live
        </Button>
      )}
      {published && hasUnpublishedChanges && (
        <Button
          size="sm"
          onClick={() => runAction("publish")}
          disabled={busy !== null || draft.dirty || draft.phase === "saving"}
          title={
            draft.dirty || draft.phase === "saving"
              ? "Wait for the draft to save before publishing."
              : "Publish the saved changes."
          }
          className="gap-1.5"
        >
          {busy === "publish" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Publish changes
        </Button>
      )}
      {published ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => runAction("unpublish")}
          disabled={busy !== null}
          className="gap-1.5"
        >
          {busy === "unpublish" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Unpublish
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => runAction("publish")}
          disabled={!canPublish}
          title={
            draft.dirty || draft.phase === "saving"
              ? "Wait for the draft to save before publishing."
              : "Publish the saved draft."
          }
          className="gap-1.5"
        >
          {busy === "publish" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Publish
        </Button>
      )}
      <PageSettingsDialog
        draft={draft}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      {draft.page && (
        <PageShareDialog
          page={draft.page}
          open={shareOpen}
          onOpenChange={setShareOpen}
          onPageUpdated={() => draft.reload()}
        />
      )}
    </div>
  );
}, areHeaderPropsEqual);

