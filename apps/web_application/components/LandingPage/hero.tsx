"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { HeroForm } from "./hero-form";
import { HeroBackdrop } from "./hero-backdrop";
import { HeroStats } from "./hero-stats";
import { EASE } from "./motion-variants";

function HeadlineLine({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.09em] -mb-[0.09em]">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  return (
    <section
      aria-label="Shorten your first link"
      className="relative w-full bg-mist flex flex-col items-center justify-center overflow-hidden pt-32 pb-20"
    >
      <HeroBackdrop />

      <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10 max-w-4xl">
        <motion.a
          href="#features"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6 inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground shadow-sm transition-colors hover:border-ember"
        >
          <motion.span
            aria-hidden="true"
            className="h-2 w-2 bg-ember"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          New · Analytics API is live
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.a>

        <div className="flex flex-col items-center justify-center text-foreground mb-8 select-none">
          <h1 className="font-display font-extrabold leading-none m-0 p-0 tracking-tight text-5xl sm:text-7xl lg:text-8xl">
            <HeadlineLine delay={0.05}>Short links,</HeadlineLine>
            <span className="block">
              <HeadlineLine delay={0.18}>
                <span className="text-ember">big</span> <span className="text-lake">impact</span>
              </HeadlineLine>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
            className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Paste a link, get a short one. Track every click with real-time
            analytics — free to start.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          className="w-full flex justify-center"
        >
          <HeroForm />
        </motion.div>

        <HeroStats />
      </div>

      {/* Bottom accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
        className="absolute bottom-0 left-0 w-full h-1.5 flex border-t border-line origin-left"
        aria-hidden="true"
      >
        <div className="w-1/3 h-full bg-ember" />
        <div className="w-1/3 h-full bg-lime-soft border-x border-line" />
        <div className="w-1/3 h-full bg-lake" />
      </motion.div>
    </section>
  );
}
