"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Disables transform/layout animation for visitors who prefer reduced motion.
 * Wrap the landing tree with this once in the route layout.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
