"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/eden";
import { LinksHeader } from "@/components/my-links/links-header";
import { LinksSearchBar } from "@/components/my-links/links-search-bar";
import { LinksTable } from "@/components/my-links/links-table";
import { EditLinkModal } from "@/components/my-links/edit-link-modal";
import { QrModal } from "@/components/my-links/qr-modal";
import type { LinkItem } from "@/components/my-links/types";

export default function MyLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "clicks">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [qrLink, setQrLink] = useState<LinkItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Copy handler ───────────────────────────────────────────────────────────
  const handleCopy = useCallback((id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // ── Fetch links ────────────────────────────────────────────────────────────
  const fetchLinks = useCallback(
    async (targetPage = 1, append = false) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const res = await api.url["my-links"].get({
          query: {
            page: targetPage.toString(),
            limit: "15",
            search: debouncedSearch || undefined,
            sortBy,
            order: sortOrder,
          },
        });

        if (
          res.data &&
          "links" in res.data &&
          "pagination" in res.data &&
          res.data.pagination
        ) {
          const newLinks = res.data.links as LinkItem[];
          const pagination = res.data.pagination;

          setLinks((prev) => (append ? [...prev, ...newLinks] : newLinks));
          setTotalCount(pagination.total);
          setHasMore(pagination.hasMore);
          setPage(targetPage);
        } else if (res.data && "message" in res.data) {
          setError(String(res.data.message));
        } else if (res.error) {
          setError(
            typeof res.error.value === "object" &&
              res.error.value &&
              "message" in res.error.value
              ? String((res.error.value as { message: unknown }).message)
              : "Failed to load links",
          );
        }
      } catch {
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, sortBy, sortOrder],
  );

  useEffect(() => {
    fetchLinks(1, false);
  }, [fetchLinks]);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchLinks(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchLinks]);

  // ── Edit handler ───────────────────────────────────────────────────────────
  const handleSave = async (
    id: string,
    url: string,
    slug: string,
  ): Promise<string | null> => {
    try {
      const res = await api.url.update.patch({
        id,
        url,
        customSlug: slug || undefined,
      });

      if (res.data && "link" in res.data) {
        const updated = res.data.link as LinkItem;
        setLinks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
        setEditingLink(null);
        return null;
      }

      if (res.data && "message" in res.data) return String(res.data.message);
      if (res.error) {
        return typeof res.error.value === "object" &&
          res.error.value &&
          "message" in res.error.value
          ? String((res.error.value as { message: unknown }).message)
          : "Failed to update link";
      }
      return "An error occurred";
    } catch {
      return "An unexpected error occurred.";
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this short link?")) return;

    setDeletingId(id);
    try {
      const res = await api.url.remove({ id }).delete();
      if (res.data && "message" in res.data) {
        setLinks((prev) => prev.filter((item) => item._id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // silent — user can refresh
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <LinksHeader
          loading={loading}
          totalCount={totalCount}
          totalClicks={totalClicks}
          loadedCount={links.length}
          onRefresh={() => fetchLinks(1, false)}
        />

        <LinksSearchBar
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearch}
          onSortChange={(by) => { setSortBy(by); setSortOrder("desc"); }}
          onSortOrderToggle={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
        />

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLinks(1, false)}
              className="text-xs h-8 border-destructive/30 hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        )}

        <LinksTable
          ref={sentinelRef}
          links={links}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          debouncedSearch={debouncedSearch}
          copiedId={copiedId}
          deletingId={deletingId}
          origin={origin}
          onCopy={handleCopy}
          onEdit={setEditingLink}
          onQr={setQrLink}
          onDelete={handleDelete}
        />
      </div>

      {editingLink && (
        <EditLinkModal
          link={editingLink}
          origin={origin}
          onClose={() => setEditingLink(null)}
          onSave={handleSave}
        />
      )}

      {qrLink && (
        <QrModal
          link={qrLink}
          origin={origin}
          onClose={() => setQrLink(null)}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
