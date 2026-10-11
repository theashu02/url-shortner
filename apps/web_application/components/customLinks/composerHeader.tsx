import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ComposerHeader() {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
        <span className="inline-block h-2.5 w-2.5 bg-ember" aria-hidden="true" />
        Create · Link studio
      </p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground uppercase sm:text-4xl">
            Craft a link <span className="text-ember">worth clicking</span>
          </h1>
          <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Shorten a URL, generate a scannable QR, or ship both at once — then track every click in real time.
          </p>
        </div>
        <Link
          href="/appv1/my-links"
          className="group inline-flex shrink-0 items-center gap-1.5 border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-ember"
        >
          View link library
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
