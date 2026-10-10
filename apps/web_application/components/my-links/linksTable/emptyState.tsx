import Link from "next/link";
import { Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  search: string;
  showCreate?: boolean;
}

export function EmptyState({ search, showCreate = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="flex h-12 w-12 items-center justify-center border bg-muted/40 text-muted-foreground">
        <Link2 className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {search ? "No matching links found" : "No links created yet"}
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {search
          ? `No links match "${search}". Try a different keyword.`
          : "Create your first short link or QR code to get started."}
      </p>
      {showCreate && !search && (
        <Link href="/appv1/custom-links" className="pt-1">
          <Button size="sm" className="gap-1.5 rounded-none text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Link</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
