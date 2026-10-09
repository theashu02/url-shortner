import type { Variants } from "framer-motion";

/** Shared snappy SaaS easing curve. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Parent container that staggers any `fadeUpItem` children on scroll into view. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

/** Standard rise-and-fade child for use inside `staggerContainer`. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Springy pop for small tiles/icons inside `staggerContainer`. */
export const popItem: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 20 },
  },
};
