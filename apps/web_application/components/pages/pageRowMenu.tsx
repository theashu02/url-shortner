"use client";

import { Copy, Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClipboard } from "@/hooks/useClipboard";
import type { PageDTO } from "@/server/services/pages";

interface PageRowMenuProps {
  page: PageDTO;
  duplicating: boolean;
  onPreview: (page: PageDTO) => void;
  onDuplicate: (page: PageDTO) => void;
  onDelete: (page: PageDTO) => void;
}

export function PageRowMenu({ page, duplicating, onPreview, onDuplicate, onDelete }: PageRowMenuProps) {
  const { copied, copy } = useClipboard();
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${page.slug}`
      : `/p/${page.slug}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={"More actions for " + page.title}
        className="flex h-8 w-8 items-center justify-center text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-none">
        <DropdownMenuItem onClick={() => onPreview(page)}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void copy(publicUrl)}>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copied!" : "Copy URL"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(page)} disabled={duplicating}>
          {duplicating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(page)}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-destructive">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RowIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-8 w-8 rounded-none p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </Button>
  );
}
