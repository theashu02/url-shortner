"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { EASE, fadeUpItem, staggerContainer } from "./motion-variants";

interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 12, decimals: 0, suffix: "M+", label: "Links shortened" },
  { value: 8, decimals: 0, suffix: "ms", label: "Median redirect" },
  { value: 99.99, decimals: 2, suffix: "%", label: "Uptime" },
];

function CountUp({ value, decimals, suffix }: Pick<Stat, "value" | "decimals" | "suffix">) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(numberRef, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = numberRef.current;
    if (!inView || !node) return;
    if (reduce) {
      node.textContent = `${value.toFixed(decimals)}${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = `${latest.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, decimals, suffix]);

  return (
    <span ref={numberRef} className="tabular-nums">
      {`0${decimals > 0 ? `.${"0".repeat(decimals)}` : ""}${suffix}`}
    </span>
  );
}

export function HeroStats() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 grid w-full max-w-2xl grid-cols-3 divide-x divide-line border border-border bg-card shadow-sm"
    >
      {STATS.map((stat) => (
        <motion.div key={stat.label} variants={fadeUpItem} className="px-4 py-5 text-center">
          <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
            <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
