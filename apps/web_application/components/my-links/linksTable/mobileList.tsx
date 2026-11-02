"use client";

import { MonitorSmartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LinkItem } from "@/components/my-links/types";
import { buildShortUrl, formatDate, isExpired } from "./linkUtils";
import { MobileListSkeleton } from "./tableSkeleton";
import { EmptyState } from "./emptyState";
import { MobileActions } from "./linkActions";

interface MobileListProps {
  links: LinkItem[];
  origin: string | undefined;
  loading: boolean;
  search: string;
  copiedId: string | null;
  deletingId: string | null;
  onCopy: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function MobileList({ links, origin, loading, search, copiedId, deletingId, onCopy, onDelete }: MobileListProps) {
  if (loading && links.length === 0) {
    return <MobileListSkeleton />;
  }

  if (links.length === 0) {
    return (
      <div className="p-4">
        <EmptyState search={search} showCreate={false} />
      </div>
    );
  }

  return (
    <>
      {links.map((link) => (
        <MobileCard
          key={link._id}
          link={link}
          origin={origin}
          isCopied={copiedId === link._id}
          isDeleting={deletingId === link._id}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

interface MobileCardProps {
  link: LinkItem;
  origin: string | undefined;
  isCopied: boolean;
  isDeleting: boolean;
  onCopy: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function MobileCard({ link, origin, isCopied, isDeleting, onCopy, onDelete }: MobileCardProps) {
  const shortUrl = buildShortUrl(origin, link.shortCode);
  const expired = isExpired(link);

  return (
    <div className="space-y-3 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-sm font-bold text-foreground">/{link.shortCode}</span>
          {link.deviceCapture && (
            <span title="Device capture enabled">
              <MonitorSmartphone className="h-3.5 w-3.5 shrink-0 text-ember" />
            </span>
          )}
          {expired && (
            <Badge variant="destructive" className="shrink-0 rounded-none text-[10px]">
              Expired
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-foreground tabular-nums">
          {link.clicks.toLocaleString()} clicks
        </span>
      </div>

      <div className="truncate border border-border/50 bg-muted/20 p-2 font-mono text-xs text-muted-foreground select-all">
        {link.url}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="shrink-0">{formatDate(link.createdAt)}</span>
        <MobileActions
          link={link}
          shortUrl={shortUrl}
          isCopied={isCopied}
          isDeleting={isDeleting}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
