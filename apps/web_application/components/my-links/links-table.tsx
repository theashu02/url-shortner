"use client";

import { forwardRef, useMemo, useState } from "react";
import Link from "next/link";
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector, useAppDispatch } from "@/store";
import { setEditingLink, setQrLink, deleteLink } from "@/store/my-links-slice";

interface LinksTableProps {
  onCopy: (id: string, text: string) => void;
}

export const LinksTable = forwardRef<HTMLDivElement, LinksTableProps>(
  function LinksTable({ onCopy }, sentinelRef) {
    const dispatch = useAppDispatch();
    const links = useAppSelector((s) => s.myLinks.links);
    const loading = useAppSelector((s) => s.myLinks.loading);
    const loadingMore = useAppSelector((s) => s.myLinks.loadingMore);
    const hasMore = useAppSelector((s) => s.myLinks.hasMore);
    const totalCount = useAppSelector((s) => s.myLinks.totalCount);
    const debouncedSearch = useAppSelector((s) => s.myLinks.debouncedSearch);
    const copiedId = useAppSelector((s) => s.myLinks.copiedId);
    const deletingId = useAppSelector((s) => s.myLinks.deletingId);

    const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

    const origin = useMemo(
      () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL),
      [],
    );

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    const handleDelete = (id: string) => {
      setLinkToDelete(id);
    };

    const confirmDelete = () => {
      if (linkToDelete) {
        dispatch(deleteLink(linkToDelete));
        setLinkToDelete(null);
      }
    };

    return (
      <>
        <Card className="rounded-none border-border bg-card shadow-sm overflow-hidden p-0 ring-0">
        {/* ── Desktop Table ── */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-65">Short Link</TableHead>
                <TableHead>Destination URL</TableHead>
                <TableHead className="w-25 text-center">Clicks</TableHead>
                <TableHead className="w-35">Created</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && links.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[32, 64, 12, 20, 24].map((w, j) => (
                      <TableCell
                        key={j}
                        className={
                          j === 4 ? "text-right" : j === 2 ? "text-center" : ""
                        }
                      >
                        <div
                          className={`h-4 w-${w} bg-muted/60 animate-pulse ${j === 4 ? "ml-auto" : j === 2 ? "mx-auto" : ""}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground">
                        <Link2 className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {debouncedSearch
                          ? "No matching links found"
                          : "No links created yet"}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {debouncedSearch
                          ? `No links match "${debouncedSearch}". Try a different keyword.`
                          : "Create your first short link or QR code to get started."}
                      </p>
                      {!debouncedSearch && (
                        <Link href="/appv1/custom-links" className="pt-1">
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs rounded-none"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create Link</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => {
                  const shortUrl = `${origin}/${link.shortCode}`;
                  const isCopied = copiedId === link._id;
                  return (
                    <TableRow key={link._id}>
                      {/* Short Link */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-primary shrink-0" />
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-mono text-sm truncate max-w-45"
                            title={shortUrl}
                          >
                            /{link.shortCode}
                          </a>
                          <button
                            onClick={() => onCopy(link._id, shortUrl)}
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                            title="Copy Short URL"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Destination URL */}
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="text-xs text-muted-foreground font-mono truncate select-all">
                            {link.url}
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </TableCell>

                      {/* Clicks */}
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-semibold px-2 py-0.5 rounded-none bg-primary/10 text-primary border-primary/20"
                        >
                          {link.clicks}
                        </Badge>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(link.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dispatch(setQrLink(link))}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none"
                            title="QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dispatch(setEditingLink(link))}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(link._id)}
                            disabled={deletingId === link._id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none"
                          >
                            {deletingId === link._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile Card List ── */}
        <div className="block md:hidden divide-y divide-border/60">
          {loading && links.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="h-5 w-32 bg-muted/60 animate-pulse" />
                <div className="h-4 w-48 bg-muted/60 animate-pulse" />
                <div className="h-8 w-full bg-muted/40 animate-pulse" />
              </div>
            ))
          ) : links.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Link2 className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                {debouncedSearch ? "No matching links" : "No links found"}
              </p>
              <p className="text-xs text-muted-foreground">
                {debouncedSearch
                  ? "Try adjusting your search keywords."
                  : "Create your first shortened link to get started."}
              </p>
            </div>
          ) : (
            links.map((link) => {
              const shortUrl = `${origin}/${link.shortCode}`;
              const isCopied = copiedId === link._id;
              return (
                <div key={link._id} className="p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-foreground text-sm truncate">
                        /{link.shortCode}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-none shrink-0"
                    >
                      {link.clicks} clicks
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground font-mono truncate select-all bg-muted/20 p-2 border border-border/50">
                    {link.url}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(link.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopy(link._id, shortUrl)}
                        className="h-7 px-2 text-xs rounded-none gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-primary" />
                            <span className="text-primary font-semibold">
                              Copied
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(setQrLink(link))}
                        className="h-7 px-2 text-xs rounded-none"
                      >
                        <QrCode className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(setEditingLink(link))}
                        className="h-7 px-2 text-xs rounded-none"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(link._id)}
                        disabled={deletingId === link._id}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 rounded-none"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Infinite Scroll Sentinel ── */}
        <div
          ref={sentinelRef}
          className="p-4 text-center border-t border-border/40"
        >
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading more links...</span>
            </div>
          )}
          {!hasMore && links.length > 0 && (
            <p className="text-sm tracking-wide text-muted-foreground py-1">
              All {totalCount} links loaded
            </p>
          )}
        </div>
      </Card>

      <Dialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete short link?</DialogTitle>
            <DialogDescription className="text-md">
              This action cannot be undone. This will permanently delete your short link and its analytics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-2 mt-4">
            <Button variant="outline" onClick={() => setLinkToDelete(null)} className="rounded-none">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="rounded-none">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    );
  },
);
