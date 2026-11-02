"use client";

import { useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast-manager";
import {
  InspireSection,
  PagesHeader,
  PagesHero,
  PagesList,
  PagesListSkeleton,
  PagesSearchBar,
  PagesSearchEmpty,
  PageShareDialog,
} from "@/components/pages";
import { PageRenderer } from "@/components/pageBlocks";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  deletePage,
  duplicatePage,
  fetchPages,
  setDebouncedSearch,
  setDeleteTarget,
  setPreviewPage,
  setSearch,
  setSharePage,
} from "@/store/pages-slice";
import type { PageDTO } from "@/server/services/pages";
import type { PageBlockType } from "@/server/lib/pages";

export default function PagesPage() {
  const dispatch = useAppDispatch();
  const {
    pages,
    total,
    loading,
    error,
    search,
    debouncedSearch,
    previewPage,
    sharePage,
    deleteTarget,
    duplicatingId,
    deleting,
  } = useAppSelector((state) => state.pages);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setDebouncedSearch(search.trim())), 350);
    return () => clearTimeout(timer);
  }, [search, dispatch]);

  useEffect(() => {
    dispatch(fetchPages({}));
  }, [debouncedSearch, dispatch]);

  const handleDuplicate = (page: PageDTO) => {
    dispatch(duplicatePage(page._id))
      .unwrap()
      .then(() => {
        toast.add({ title: "Page duplicated", description: "\"" + page.title + "\" was cloned.", type: "success" });
      })
      .catch((err: unknown) => {
        toast.add({ title: "Duplicate failed", description: err instanceof Error ? err.message : "Try again.", type: "error" });
      });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const title = deleteTarget.title;
    dispatch(deletePage(deleteTarget._id))
      .unwrap()
      .then(() => {
        toast.add({ title: "Page deleted", description: "\"" + title + "\" was removed.", type: "success" });
      })
      .catch((err: unknown) => {
        toast.add({ title: "Delete failed", description: err instanceof Error ? err.message : "Try again.", type: "error" });
      });
  };

  const showEmptyState = !loading && !error && pages.length === 0 && debouncedSearch.length === 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full space-y-6">
        <PagesHeader total={total} />
        {!showEmptyState && (
          <PagesSearchBar value={search} onChange={(value) => dispatch(setSearch(value))} />
        )}
        {error && (
          <div className="flex items-center gap-3 border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button variant="outline" size="sm" onClick={() => dispatch(fetchPages({ force: true }))} className="h-8 rounded-none border-destructive/30 text-xs hover:bg-destructive/10">
              Retry
            </Button>
          </div>
        )}
        {loading ? (
          <PagesListSkeleton />
        ) : showEmptyState ? (
          <>
            <PagesHero />
            <hr className="border-border" />
            <InspireSection />
          </>
        ) : pages.length === 0 ? (
          <PagesSearchEmpty />
        ) : (
          <PagesList
            pages={pages}
            duplicatingId={duplicatingId}
            onPreview={(page) => dispatch(setPreviewPage(page))}
            onShare={(page) => dispatch(setSharePage(page))}
            onDuplicate={handleDuplicate}
            onDelete={(page) => dispatch(setDeleteTarget(page))}
          />
        )}
      </div>
      <Dialog open={previewPage !== null} onOpenChange={(open) => !open && dispatch(setPreviewPage(null))}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-none p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border/60 p-5 text-left">
            <DialogTitle className="text-lg font-bold">{previewPage?.title}</DialogTitle>
            <DialogDescription className="font-mono">/p/{previewPage?.slug}</DialogDescription>
          </DialogHeader>
          {previewPage && (
            <div className="p-5">
              <PageRenderer
                title={previewPage.title}
                theme={previewPage.theme}
                blocks={previewPage.blocks.map((block) => ({ ...block, type: block.type as PageBlockType }))}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {sharePage && (
        <PageShareDialog
          page={sharePage}
          open
          onOpenChange={(open) => !open && dispatch(setSharePage(null))}
          onPageUpdated={() => dispatch(fetchPages({ force: true }))}
        />
      )}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && !deleting && dispatch(setDeleteTarget(null))}>
        <DialogContent className="gap-0 rounded-none p-0 sm:max-w-md">
          <DialogHeader className="p-5 text-left">
            <DialogTitle className="text-lg font-bold">Delete this page?</DialogTitle>
            <DialogDescription>
              {deleteTarget ? "\"" + deleteTarget.title + "\" will be permanently removed." : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border/60 p-5">
            <Button variant="outline" onClick={() => dispatch(setDeleteTarget(null))} disabled={deleting} className="rounded-none">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-none">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Delete page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
