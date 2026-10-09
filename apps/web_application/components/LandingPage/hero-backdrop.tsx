"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface FloatingSquare {
  left: string;
  top: string;
  size: number;
  /** Solid or outline square in brand colors, e.g. "bg-ember" or "border border-lake". */
  className: string;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
}

const HERO_SQUARES: FloatingSquare[] = [
  { left: "6%", top: "24%", size: 14, className: "bg-ember", duration: 9, delay: 0, drift: 28, spin: 90 },
  { left: "12%", top: "64%", size: 10, className: "border border-lake", duration: 11, delay: 1.2, drift: 22, spin: -90 },
  { left: "20%", top: "30%", size: 8, className: "bg-lake", duration: 8, delay: 0.6, drift: 18, spin: 45 },
  { left: "80%", top: "26%", size: 12, className: "border border-ember", duration: 10, delay: 0.3, drift: 26, spin: 90 },
  { left: "88%", top: "58%", size: 16, className: "bg-lime-soft border border-line", duration: 12, delay: 1.6, drift: 20, spin: -45 },
  { left: "74%", top: "72%", size: 9, className: "bg-lake", duration: 9, delay: 2, drift: 24, spin: 180 },
  { left: "45%", top: "16%", size: 8, className: "border border-line", duration: 13, delay: 0.9, drift: 16, spin: 90 },
];

/**
 * Brand squares that drift upward and rotate on an infinite loop.
 * Renders statically when the visitor prefers reduced motion.
 */
export function FloatingSquares({ items }: { items: FloatingSquare[] }) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((square, index) => (
        <motion.span
          key={index}
          className={`absolute ${square.className}`}
          style={{ left: square.left, top: square.top, width: square.size, height: square.size }}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: [0, 1, 1, 0], y: [0, -square.drift], rotate: [0, square.spin] }}
          transition={
            reduce
              ? undefined
              : { duration: square.duration, delay: square.delay, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }
          }
        />
      ))}
    </div>
  );
}

/** Faded blueprint grid plus drifting squares behind the hero content. */
export function HeroBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--line) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--line) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 75%)",
        }}
      />
      <FloatingSquares items={HERO_SQUARES} />
    </>
  );
}
