import { PageRow } from "./pageRow";
import type { PageDTO } from "@/server/services/pages";

interface PagesListProps {
  pages: PageDTO[];
  duplicatingId: string | null;
  onPreview: (page: PageDTO) => void;
  onShare: (page: PageDTO) => void;
  onDuplicate: (page: PageDTO) => void;
  onDelete: (page: PageDTO) => void;
}

export function PagesList({ pages, duplicatingId, onPreview, onShare, onDuplicate, onDelete }: PagesListProps) {
  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <PageRow
          key={page._id}
          page={page}
          duplicating={duplicatingId === page._id}
          onPreview={onPreview}
          onShare={onShare}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
      <div className="flex items-center gap-4 px-2 py-6" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <p className="text-xs text-muted-foreground">You have reached the end of your Pages</p>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

export function PagesListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading pages">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-4 border border-border bg-card p-4">
          <div className="h-24 w-20 shrink-0 animate-pulse bg-muted" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-1/3 animate-pulse bg-muted" />
            <div className="h-3 w-1/2 animate-pulse bg-muted" />
            <div className="h-3 w-1/4 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PagesSearchEmpty() {
  return (
    <div className="flex items-center justify-center border border-dashed border-border bg-card px-6 py-16 text-center">
      <p className="max-w-sm text-sm text-muted-foreground">
        No pages match your search. Try another title or URL.
      </p>
    </div>
  );
}
