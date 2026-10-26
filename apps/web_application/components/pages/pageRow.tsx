"use client";

import Link from "next/link";
import { BarChart3, MousePointerClick, Pencil, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageThumbnail } from "./pageThumbnail";
import { PageRowMenu, RowIconButton } from "./pageRowMenu";
import { formatCreated, formatUpdatedRelative, pluralize } from "./pageDates";
import type { PageDTO } from "@/server/services/pages";

interface PageRowProps {
  page: PageDTO;
  duplicating: boolean;
  onPreview: (page: PageDTO) => void;
  onShare: (page: PageDTO) => void;
  onDuplicate: (page: PageDTO) => void;
  onDelete: (page: PageDTO) => void;
}

export function PageRow({ page, duplicating, onPreview, onShare, onDuplicate, onDelete }: PageRowProps) {
  return (
    <article className="flex gap-4 border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <PageThumbnail page={page} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate text-base font-bold text-foreground">
            <Link href={"/appv1/pages/" + page._id} className="hover:underline">
              {"/p/" + page.slug}
            </Link>
          </h2>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={"/appv1/pages/" + page._id} />}
              aria-label={"Edit " + page.title}
              title={"Edit " + page.title}
              className="h-8 w-8 rounded-none p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <RowIconButton label={"Share " + page.title} onClick={() => onShare(page)}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </RowIconButton>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={"/appv1/pages/" + page._id + "/analytics"} />}
              aria-label={"View stats for " + page.title}
              title="Stats"
              className="h-8 w-8 rounded-none p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <PageRowMenu
              page={page}
              duplicating={duplicating}
              onPreview={onPreview}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {page.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatCreated(page.createdAt)} <span aria-hidden="true">•</span> {formatUpdatedRelative(page.updatedAt)}
        </p>
        <p className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            <strong className="font-semibold text-foreground">{pluralize(page.views, "view")}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
            <strong className="font-semibold text-foreground">
              {pluralize(page.clicks ?? 0, "engagement")}
            </strong>
          </span>
        </p>
      </div>
    </article>
  );
}
