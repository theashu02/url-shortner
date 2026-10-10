"use client";

import { Check, Copy, Loader2, Pencil, QrCode, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { setEditingLink, setQrLink, setShareLink } from "@/store/my-links-slice";
import type { LinkItem } from "@/components/my-links/types";
import { isExpired } from "./linkUtils";

interface DesktopActionsProps {
  link: LinkItem;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}

export function DesktopActions({ link, isDeleting, onDelete }: DesktopActionsProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        title="QR Code"
        onClick={() => dispatch(setQrLink(link))}
        className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
      >
        <QrCode className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Share"
        onClick={() => dispatch(setShareLink(link))}
        className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      {!isExpired(link) && (
        <Button
          variant="ghost"
          size="icon"
          title="Edit"
          onClick={() => dispatch(setEditingLink(link))}
          className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="Delete"
        disabled={isDeleting}
        onClick={() => onDelete(link._id)}
        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

interface MobileActionsProps {
  link: LinkItem;
  shortUrl: string;
  isCopied: boolean;
  isDeleting: boolean;
  onCopy: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function MobileActions({ link, shortUrl, isCopied, isDeleting, onCopy, onDelete }: MobileActionsProps) {
  const dispatch = useAppDispatch();
  const expired = isExpired(link);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCopy(link._id, shortUrl)}
        className="h-7 gap-1 rounded-none px-2 text-xs"
      >
        {isCopied ? (
          <>
            <Check className="h-3 w-3 text-ember" />
            <span className="font-semibold text-ember">Copied</span>
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
        aria-label="Show QR code"
        onClick={() => dispatch(setQrLink(link))}
        className="h-7 w-7 rounded-none"
      >
        <QrCode className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        aria-label="Share link"
        onClick={() => dispatch(setShareLink(link))}
        className="h-7 w-7 rounded-none"
      >
        <Share2 className="h-3 w-3" />
      </Button>
      {!expired && (
        <Button
          variant="outline"
          size="sm"
          aria-label="Edit link"
          onClick={() => dispatch(setEditingLink(link))}
          className="h-7 w-7 rounded-none"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        aria-label="Delete link"
        disabled={isDeleting}
        onClick={() => onDelete(link._id)}
        className="h-7 w-7 rounded-none text-destructive hover:bg-destructive/10"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
