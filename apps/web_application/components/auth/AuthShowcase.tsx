import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "99.99%", label: "Service SLA", color: "text-ember" },
  { value: "< 10ms", label: "Avg Redirect", color: "text-lime-soft" },
  { value: "12.4M", label: "Reroutes / Mo", color: "text-on-inkband" },
];

export function AuthShowcase() {
  return (
    <div className="relative hidden h-full shrink-0 flex-col bg-inkband overflow-hidden lg:flex lg:w-[55%] xl:w-[60%]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-10 pt-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ember text-on-ember px-4 py-2 border-2 border-line"
          aria-label="Back to SimpLx home"
        >
          <span className="font-display font-bold text-2xl uppercase tracking-widest">
            SimpLx
          </span>
        </Link>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-on-inkband/60">
          System active // Global
        </p>
      </div>

      {/* Massive Typography */}
      <div className="px-10 pt-8 relative z-10 select-none">
        <p className="font-display font-bold uppercase leading-[0.85] tracking-tighter text-on-inkband text-6xl xl:text-7xl">
          SHORT
          <br />
          LINKS <span className="text-ember">BIG</span>
          <br />
          <span className="text-lime-soft">IMPACT</span>
        </p>
        <p className="mt-4 max-w-md text-on-inkband/70 font-medium leading-relaxed">
          Sign in to create secure, analytics-tracked short links — served
          from the Redis edge in single-digit milliseconds.
        </p>
      </div>

      {/* Terminal slip — hidden on short viewports so the panel always fits */}
      <div className="px-10 pt-6 relative z-10 [@media(max-height:860px)]:hidden">
        <div className="max-w-md bg-card border-4 border-line">
          <div className="flex items-center justify-between border-b-2 border-line px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 bg-ember" />
              <span className="h-3 w-3 bg-lime-soft" />
              <span className="h-3 w-3 bg-lake" />
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              edge_router.sh
            </span>
          </div>
          <div className="p-5 space-y-1.5 font-mono text-[13px] text-foreground">
            <p className="text-muted-foreground">
              {"// shrt.run/x72j -> example.com/long-destination"}
            </p>
            <p>
              <span className="text-muted-foreground">$</span> curl -I
              https://shrt.run/x72j
            </p>
            <p>
              <Badge className="h-auto bg-lime-soft px-2 py-0.5 font-mono text-[13px] font-bold text-on-lime hover:bg-lime-soft">
                HTTP/2 302 Found
              </Badge>
            </p>
            <p>
              X-Routing-Time: <span className="font-bold">1.84ms</span>
            </p>
            <p>
              X-Cache: <span className="font-bold">HIT (Redis Edge)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <ul className="mx-10 mt-6 grid grid-cols-3 border-2 border-line bg-inkband relative z-10">
        {stats.map((stat, i) => (
          <li
            key={stat.label}
            className={`px-5 py-3 ${i > 0 ? "border-l-2 border-line" : ""}`}
          >
            <p className={`font-display font-bold text-2xl ${stat.color}`}>
              {stat.value}
            </p>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-on-inkband/60">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      {/* Geometric bottom elements */}
      <div className="relative h-17.5 shrink-0 overflow-hidden flex" aria-hidden="true">
        <div className="w-1/3 h-full bg-ember border-t-8 border-r-8 border-line transform translate-y-1/2" />
        <div className="w-1/3 h-full bg-lime-soft border-t-8 border-r-8 border-line transform translate-y-1/4" />
        <div className="w-1/3 h-full bg-lake border-t-8 border-line transform translate-y-1/3" />
      </div>
    </div>
  );
}
