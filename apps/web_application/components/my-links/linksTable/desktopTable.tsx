"use client";

import { Check, Copy, ExternalLink, MonitorSmartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LinkItem } from "@/components/my-links/types";
import { buildShortUrl, formatDate, isExpired } from "./linkUtils";
import { TableSkeleton } from "./tableSkeleton";
import { EmptyState } from "./emptyState";
import { DesktopActions } from "./linkActions";

const HEADERS = ["Short Link", "Destination URL", "Clicks", "Status", "Created", "Actions"] as const;

interface DesktopTableProps {
  links: LinkItem[];
  origin: string | undefined;
  loading: boolean;
  search: string;
  copiedId: string | null;
  deletingId: string | null;
  onCopy: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function DesktopTable({ links, origin, loading, search, copiedId, deletingId, onCopy, onDelete }: DesktopTableProps) {
  if (loading && links.length === 0) {
    return (
      <Table className="min-w-215">
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-inkband hover:bg-inkband">
            {HEADERS.map((header, index) => (
              <TableHead
                key={header}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-on-inkband ${index === 2 ? "text-center" : ""} ${index === 5 ? "text-right" : ""}`}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableSkeleton />
        </TableBody>
      </Table>
    );
  }

  if (links.length === 0) {
    return (
      <Table className="min-w-215">
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-inkband hover:bg-inkband">
            {HEADERS.map((header) => (
              <TableHead key={header} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-on-inkband">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={HEADERS.length} className="py-4">
              <EmptyState search={search} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table className="min-w-215">
      <TableHeader>
        <TableRow className="border-b border-border/40 bg-inkband hover:bg-inkband">
          {HEADERS.map((header, index) => (
            <TableHead
              key={header}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-on-inkband ${index === 2 ? "text-center" : ""} ${index === 5 ? "text-right" : ""}`}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <DesktopRow
            key={link._id}
            link={link}
            origin={origin}
            isCopied={copiedId === link._id}
            isDeleting={deletingId === link._id}
            onCopy={onCopy}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface DesktopRowProps {
  link: LinkItem;
  origin: string | undefined;
  isCopied: boolean;
  isDeleting: boolean;
  onCopy: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function DesktopRow({ link, origin, isCopied, isDeleting, onCopy, onDelete }: DesktopRowProps) {
  const shortUrl = buildShortUrl(origin, link.shortCode);
  const expired = isExpired(link);

  return (
    <TableRow className="group transition-colors hover:bg-mist">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={shortUrl}
            className="max-w-45 truncate font-mono text-sm font-bold text-foreground transition-colors group-hover:text-ember"
          >
            {link.shortCode}
          </a>
          {link.deviceCapture && (
            <span title="Device capture enabled">
              <MonitorSmartphone className="h-3.5 w-3.5 shrink-0 text-ember" />
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Copy Short URL"
            onClick={() => onCopy(link._id, shortUrl)}
            className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-ember" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex max-w-xs items-center gap-2 lg:max-w-md">
          <span className="truncate font-mono text-xs text-muted-foreground select-all">{link.url}</span>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open destination"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </TableCell>

      <TableCell className="text-center text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">
        {link.clicks.toLocaleString()}
      </TableCell>

      <TableCell>
        {expired ? (
          <Badge variant="destructive" className="rounded-none text-[11px]">
            Expired
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Active</span>
        )}
      </TableCell>

      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
        {formatDate(link.createdAt)}
      </TableCell>

      <TableCell className="text-right">
        <DesktopActions link={link} isDeleting={isDeleting} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
