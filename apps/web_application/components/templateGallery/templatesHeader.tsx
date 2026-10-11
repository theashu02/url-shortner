import Link from "next/link";
import { X } from "lucide-react";

export function TemplatesHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Select a template
        </h1>
        <p className="text-sm text-foreground/70">
          You will be able to change the content, colors, and layout later.
        </p>
      </div>
      <Link
        href="/appv1/pages"
        aria-label="Back to Pages"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ember transition-colors hover:bg-mist"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
