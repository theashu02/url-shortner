"use client";

import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  } = useAddToPageDialog(link);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 rounded-2xl p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/60 p-5 text-left">
          <DialogTitle className="text-lg font-bold">Add to a page</DialogTitle>
          <DialogDescription>
            Append /{link.shortCode} to one of your page drafts. Published pages stay live until you publish again.
          </DialogDescription>
        </DialogHeader>
        {savedPageId ? (
          <div className="space-y-4 p-5">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-ember" aria-hidden="true" />
              Link added to your draft.
            </p>
            <DialogFooter className="p-0">
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              <Link href={`/appv1/pages/${savedPageId}`}>
                <Button className="bg-ember text-on-ember hover:bg-ember/90">
                  Open editor
                </Button>
              </Link>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="add-page" className="text-xs font-semibold">
                Page
              </Label>
              {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Loading pages...
                </p>
              ) : pages.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You have no pages yet. Create one from the templates gallery first.
                </p>
              ) : (
                <select
                  id="add-page"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {pages.map((page) => (
                    <option key={page._id} value={page._id}>
                      {page.title} (/p/{page.slug})
                      {page.status === "published" ? "" : " - draft"}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-label" className="text-xs font-semibold">
                Button label
              </Label>
              <Input
                id="add-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={80}
                placeholder="My link"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="p-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !pageId || label.trim().length === 0}
                className="bg-ember text-on-ember hover:bg-ember/90"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Add link
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
