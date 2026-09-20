"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  fetchLinks,
  setDebouncedSearch,
  setCopiedId,
} from "@/store/my-links-slice";
import { LinksHeader } from "@/components/my-links/links-header";
import { LinksSearchBar } from "@/components/my-links/links-search-bar";
import { LinksTable } from "@/components/my-links/links-table";
import { EditLinkModal } from "@/components/my-links/edit-link-modal";
import { QrModal } from "@/components/my-links/qr-modal";
import { ShareModal } from "@/components/my-links/shareModal";

export default function MyLinksPage() {
  const dispatch = useAppDispatch();

  const search = useAppSelector((s) => s.myLinks.search);
  const debouncedSearch = useAppSelector((s) => s.myLinks.debouncedSearch);
  const loading = useAppSelector((s) => s.myLinks.loading);
  const loadingMore = useAppSelector((s) => s.myLinks.loadingMore);
  const hasMore = useAppSelector((s) => s.myLinks.hasMore);
  const page = useAppSelector((s) => s.myLinks.page);
  const error = useAppSelector((s) => s.myLinks.error);
  const editingLink = useAppSelector((s) => s.myLinks.editingLink);
  const qrLink = useAppSelector((s) => s.myLinks.qrLink);
  const shareLink = useAppSelector((s) => s.myLinks.shareLink);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => dispatch(setDebouncedSearch(search.trim())), 350);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  // Fetch on filter/sort changes
  useEffect(() => {
    dispatch(fetchLinks({ page: 1, append: false }));
  }, [debouncedSearch, dispatch]);

  // Copy handler timer cleanup
  const handleCopy = useCallback(
    (id: string, text: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      dispatch(setCopiedId(id));
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => dispatch(setCopiedId(null)), 2000);
    },
    [dispatch],
  );

  // Infinite scroll 
  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          dispatch(fetchLinks({ page: page + 1, append: true }));
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, dispatch]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <LinksHeader />

        <LinksSearchBar />

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchLinks({ page: 1, append: false, force: true }))}
              className="text-xs h-8 border-destructive/30 hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        )}

        <LinksTable ref={sentinelRef} onCopy={handleCopy} />
      </div>

      {editingLink && <EditLinkModal />}

      {qrLink && <QrModal onCopy={handleCopy} />}

      {shareLink && <ShareModal />}
    </div>
  );
}
