"use client";

import Link from "next/link";
import { Check, ChevronDown, Loader2, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useAddToPageDialog } from "./useAddToPageDialog";
import type { LinkItem } from "./types";

export function AddToPageDialog({
  link,
  onClose,
}: {
  link: LinkItem;
  onClose: () => void;
}) {
  const {
    pages,
    loading,
    error,
    saving,
    savedPageId,
    pageId,
    setPageId,
    label,
    setLabel,
    handleSubmit,
    refreshPages,
  } = useAddToPageDialog(link);

  const labelCount = `${label.length}/80`;
  const canSubmit = !saving && pageId.length > 0 && label.trim().length > 0;
  const selectedPage = pages.find((page) => page._id === pageId) ?? null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 rounded-none p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/60 p-5">
          <DialogTitle className="text-lg font-bold">Add to a page</DialogTitle>
          <DialogDescription>
            Append{" "}
            <span className="font-mono text-xs text-foreground">
              /{link.shortCode}
            </span>{" "}
            to one of your page drafts. Published pages stay live until you
            publish again.
          </DialogDescription>
        </DialogHeader>

        {savedPageId ? (
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 border border-border/60 bg-muted/20 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Link added to your draft
                </p>
                <p className="text-xs text-muted-foreground">
                  Open the editor to arrange it, then publish when ready.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 text-xs rounded-none"
              >
                Done
              </Button>
              <Link href={`/appv1/pages/${savedPageId}`}>
                <Button className="h-9 px-5 text-xs font-semibold rounded-none">
                  Open editor
                </Button>
              </Link>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-page" className="text-xs font-semibold">
                  Page <span className="text-destructive">*</span>
                </Label>
                {!loading && pages.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>
                      {pages.length} page{pages.length === 1 ? "" : "s"}
                    </span>
                    <button
                      type="button"
                      onClick={refreshPages}
                      aria-label="Refresh pages"
                      title="Refresh pages"
                      className="flex h-5 w-5 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                )}
                {loading && pages.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <RefreshCw
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Refreshing...</span>
                  </span>
                )}
              </div>

              {loading && pages.length === 0 ? (
                <Skeleton
                  className="h-10 w-full rounded-none"
                  aria-label="Loading pages"
                />
              ) : pages.length === 0 ? (
                error ? (
                  <div className="border border-destructive/20 bg-destructive/10 p-4 text-center">
                    <p className="text-xs font-semibold text-foreground">
                      Could not load your pages
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {error}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={refreshPages}
                      className="mt-3 h-8 rounded-none text-xs"
                    >
                      <RefreshCw
                        className="mr-1.5 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Try again
                    </Button>
                  </div>
                ) : (
                  <div className="border border-dashed border-border p-4 text-center">
                    <p className="text-xs font-semibold text-foreground">
                      You have no pages yet
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Create one from the templates gallery first, then come
                      back to attach this link.
                    </p>
                  </div>
                )
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        id="add-page"
                        type="button"
                        variant="outline"
                        className="h-auto min-h-10 w-full justify-between rounded-none px-3 py-1.5 text-left font-normal"
                      >
                        {selectedPage ? (
                          <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {selectedPage.title}
                              </span>
                              <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                /p/{selectedPage.slug}
                              </span>
                            </span>
                            <Badge
                              variant={
                                selectedPage.status === "published"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {selectedPage.status === "published"
                                ? "Live"
                                : "Draft"}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Select a page
                          </span>
                        )}
                        <ChevronDown
                          className="ml-2 h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Button>
                    }
                  />
                  <DropdownMenuContent
                    align="start"
                    className="max-h-56 overflow-y-auto rounded-none p-1"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[11px] tracking-widest uppercase">
                        Your pages
                      </DropdownMenuLabel>
                      {pages.map((page) => {
                        const selected = page._id === pageId;
                        const published = page.status === "published";
                        return (
                          <DropdownMenuItem
                            key={page._id}
                            onClick={() => setPageId(page._id)}
                            className={cn(
                              "gap-2 px-2 py-2",
                              selected && "bg-muted/40",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-foreground">
                                {page.title}
                              </span>
                              <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                /p/{page.slug}
                              </span>
                            </span>
                            <Badge
                              variant={published ? "default" : "outline"}
                            >
                              {published ? "Live" : "Draft"}
                            </Badge>
                            {selected && (
                              <Check
                                className="h-3.5 w-3.5 shrink-0 text-foreground"
                                aria-hidden="true"
                              />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-label" className="text-xs font-semibold">
                  Button label <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {labelCount}
                </span>
              </div>
              <Input
                id="add-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={80}
                placeholder="My link"
                className="h-10 rounded-none text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                This text shows on the page button linking to{" "}
                <span className="font-mono">/{link.shortCode}</span>.
              </p>
            </div>

            {error && pages.length > 0 && (
              <p className="border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="h-9 px-4 text-xs rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-9 gap-1.5 px-5 text-xs font-semibold rounded-none"
              >
                {saving ? (
                  <>
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add link</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
