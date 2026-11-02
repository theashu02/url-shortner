"use client";

import { motion, useReducedMotion } from "framer-motion";

const ITEMS = [
  "Custom domains",
  "Real-time analytics",
  "QR codes",
  "REST API",
  "Link expiration",
  "Password protection",
  "Team workspaces",
  "99.99% uptime",
];

function RowItem({ item }: { item: string }) {
  return (
    <span className="flex items-center">
      <span className="px-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
        {item}
      </span>
      <span className="h-2 w-2 rotate-45 bg-ember shrink-0" aria-hidden="true" />
    </span>
  );
}

export function Marquee() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section aria-label="Platform capabilities" className="overflow-hidden border-y border-border bg-card py-4">
        <div className="flex flex-wrap items-center justify-center">
          {ITEMS.map((item) => (
            <RowItem key={item} item={item} />
          ))}
        </div>
      </section>
    );
  }

  // Rendered twice side-by-side; the track slides exactly one copy width
  // so the loop restarts seamlessly.
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <RowItem key={item} item={item} />
      ))}
    </div>
  );

  return (
    <section aria-label="Platform capabilities" className="overflow-hidden border-y border-border bg-card py-4">
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {row(false)}
        {row(true)}
      </motion.div>
    </section>
  );
}
