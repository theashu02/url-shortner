import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PagesHeader({ total }: { total: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Social Pages
        </h1>
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "Share all your links from one page."
            : total + (total === 1 ? " page" : " pages") + " live in your account."}
        </p>
      </div>
      <Button
        nativeButton={false}
        render={<Link href="/create/templates" />}
        className="gap-1.5 rounded-none bg-ember px-4 text-on-ember hover:bg-ember/90"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create Page
      </Button>
    </div>
  );
}
