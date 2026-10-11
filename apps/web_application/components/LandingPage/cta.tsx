"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { FloatingSquares, type FloatingSquare } from "./hero-backdrop";

const CTA_SQUARES: FloatingSquare[] = [
  { left: "8%", top: "20%", size: 12, className: "bg-ember", duration: 8, delay: 0, drift: 20, spin: 90 },
  { left: "16%", top: "68%", size: 9, className: "border border-ember", duration: 10, delay: 1, drift: 16, spin: -90 },
  { left: "84%", top: "24%", size: 10, className: "bg-lake", duration: 9, delay: 0.5, drift: 18, spin: 45 },
  { left: "90%", top: "62%", size: 14, className: "border border-on-inkband/40", duration: 11, delay: 1.4, drift: 22, spin: 90 },
];

export function CTA() {
  return (
    <section aria-label="Get started with SimpLx" className="bg-mist px-4 md:px-8 pb-20 md:pb-24">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="relative overflow-hidden border border-border bg-inkband px-6 py-14 md:p-16 text-center text-on-inkband shadow-md">
            <FloatingSquares items={CTA_SQUARES} />

            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember">
                Free forever plan · No credit card
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Ready to make every click count?
              </h2>
              <p className="mt-4 text-lg opacity-80 leading-relaxed">
                Join thousands of makers shortening, sharing, and measuring
                links with SimpLx. Your first link takes seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.a
                  href="/auth"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 bg-ember px-8 text-sm font-semibold text-on-ember"
                >
                  Start shortening free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </motion.a>
                <motion.a
                  href="#pricing"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center border border-on-inkband/30 px-8 text-sm font-semibold text-on-inkband transition-colors hover:bg-on-inkband hover:text-inkband"
                >
                  View pricing
                </motion.a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
