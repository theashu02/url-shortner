"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "./motion-variants";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds before the reveal starts. */
  delay?: number;
  /** Vertical distance (px) the element travels while revealing. */
  y?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
