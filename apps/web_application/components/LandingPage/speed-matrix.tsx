"use client";

import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Database, Activity, User, ExternalLink } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { Eyebrow } from "./eyebrow";
import { fadeUpItem, popItem, staggerContainer } from "./motion-variants";

interface Step {
  icon: ComponentType<{ className?: string }>;
  tile: string;
  title: string;
  sub: string | null;
  live?: boolean;
  arrow?: boolean;
}

const STEPS: Step[] = [
  { icon: User, tile: "bg-ember text-on-ember", title: "User click", sub: null },
  { icon: Database, tile: "bg-lake text-on-lake", title: "Redis edge cache", sub: "Sub-10ms lookup", live: true },
  { icon: ExternalLink, tile: "bg-lime-soft text-on-lime border border-border", title: "302 redirect", sub: "Instant delivery", arrow: true },
  { icon: Activity, tile: "bg-ember-deep text-on-ember", title: "Async analytics", sub: "Tracked in the background" },
];

export function SpeedMatrix() {
  const reduce = useReducedMotion();

  return (
    <section aria-label="How SimpLx achieves faster redirects" className="py-20 md:py-24 px-4 md:px-8 bg-mist relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          <div className="flex-1">
            <ScrollReveal>
              <Eyebrow>Under the hood</Eyebrow>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mt-4 mb-6 tracking-tight leading-tight">
                Why are we <span className="text-lake">faster?</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We separate link creation from redirection. Redirect requests are served directly from Redis with sub-10ms 302 responses while analytics are processed asynchronously, ensuring every click remains extremely fast regardless of traffic volume.
              </p>
            </ScrollReveal>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col gap-4 relative"
            >
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-border" />
              {/* Traveling pulse showing a click flowing through the pipeline */}
              {!reduce && (
                <motion.span
                  aria-hidden="true"
                  className="absolute left-6 z-0 h-2 w-2 -translate-x-1/2 rotate-45 bg-ember"
                  animate={{ top: ["2%", "98%"] }}
                  transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
                />
              )}

              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.title} variants={fadeUpItem} className="flex items-center gap-4 relative z-10">
                    <motion.div
                      variants={popItem}
                      className={`w-12 h-12 rounded-none ${step.tile} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <div className="bg-card border border-border p-4 rounded-none flex-1 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-lg tracking-tight text-foreground">{step.title}</p>
                          {step.live && (
                            <span className="inline-flex items-center gap-1.5 border border-border bg-lime-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-lime">
                              <motion.span
                                aria-hidden="true"
                                className="h-1.5 w-1.5 bg-ember-deep"
                                animate={{ opacity: [1, 0.25, 1] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                              />
                              Live
                            </span>
                          )}
                        </div>
                        {step.arrow && <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                      </div>
                      {step.sub && (
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{step.sub}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
