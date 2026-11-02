"use client";

import { useState } from "react";
import { AlertCircle, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageRenderer } from "@/components/pageBlocks";
import { cn } from "@/lib/utils";
import { BlockInspector } from "./BlockInspector";
import { BlockList } from "./BlockList";
import { EditorHeader } from "./EditorHeader";
import { usePageDraft } from "./usePageDraft";

export function EditorShell({ pageId }: { pageId: string }) {
  const draft = usePageDraft(pageId);
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");

  if (draft.phase === "loading") {
    return (
      <div className="flex min-h-96 flex-col">
        <div className="h-13 animate-pulse bg-muted" aria-hidden="true" />
        <div className="grid flex-1 gap-6 p-4 sm:p-6 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-none bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (draft.loadError) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 px-4 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">
          Could not load this page
        </p>
        <p className="text-sm text-muted-foreground">{draft.loadError}</p>
        <Button variant="outline" size="sm" onClick={draft.reload}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorHeader draft={draft} />
      <div className="grid flex-1 items-start gap-6 p-4 sm:p-6 lg:grid-cols-[300px_minmax(0,1fr)_400px]">
        <section
          aria-label="Blocks"
          className="min-w-0 rounded-none border border-border bg-card p-4 lg:sticky lg:top-6"
        >
          <BlockList
            blocks={draft.blocks}
            selectedKey={draft.selectedKey}
            onSelect={draft.setSelectedKey}
            onAdd={draft.addBlock}
            onRemove={draft.removeBlock}
            onDuplicate={draft.duplicateBlock}
            onToggle={draft.toggleBlock}
            onMove={draft.moveBlock}
            onReorder={draft.reorderBlock}
          />
        </section>

        <aside
          aria-label="Appearance and settings"
          className="min-w-0"
        >
          <BlockInspector draft={draft} />
        </aside>

        <section
          aria-label="Preview"
          className="mx-auto flex w-full min-w-0 flex-col gap-4 lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Preview
            </p>
            <div className="flex items-center gap-1 rounded-none border border-border bg-card p-1">
              <Button
                variant={viewport === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewport("mobile")}
                className="gap-1.5 rounded-none px-3"
                aria-pressed={viewport === "mobile"}
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                Mobile
              </Button>
              <Button
                variant={viewport === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewport("desktop")}
                className="gap-1.5 rounded-none px-3"
                aria-pressed={viewport === "desktop"}
              >
                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                Desktop
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "mx-auto w-full transition-all",
              viewport === "mobile" ? "max-w-sm" : "max-w-xl"
            )}
          >
            <PageRenderer
              title={draft.title}
              theme={draft.theme}
              blocks={draft.blocks}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
