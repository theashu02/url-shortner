import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  QrCode,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

const PERKS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Zap,
    title: "Live in seconds",
    body: "Redirects served from the edge with instant activation.",
  },
  {
    icon: BarChart3,
    title: "Clicks, decoded",
    body: "Real-time analytics with geo and device breakdowns.",
  },
  {
    icon: QrCode,
    title: "Print-ready QR",
    body: "High-resolution codes that scan on any smartphone.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    body: "Abuse screening and rate limits on every redirect.",
  },
];

export function SideRail() {
  return (
    <aside className="space-y-4">
      <section aria-label="Why SimpLx" className="overflow-hidden border border-border bg-inkband text-on-inkband shadow-sm">
        <div className="space-y-4 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase opacity-70">
            <span className="inline-block h-2 w-2 bg-ember" aria-hidden="true" />
            Every link ships with
          </p>
          <ul className="space-y-4">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-card/10">
                  <perk.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{perk.title}</span>
                  <span className="block text-xs opacity-70">{perk.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/appv1/analytics"
            className="group inline-flex items-center gap-1.5 bg-ember px-4 py-2.5 text-xs font-bold text-on-ember transition-colors hover:bg-ember/90"
          >
            See analytics in action
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="flex h-1.5" aria-hidden="true">
          <div className="h-full w-1/3 bg-ember" />
          <div className="h-full w-1/3 bg-lime-soft" />
          <div className="h-full w-1/3 bg-lake" />
        </div>
      </section>

      <section aria-label="Pro tip" className="border border-dashed border-border bg-card p-5">
        <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          Pro tip
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Branded back-halves earn more trust — and more clicks. Add a custom
          slug above, then layer UTMs so every campaign reports cleanly.
        </p>
      </section>
    </aside>
  );
}
