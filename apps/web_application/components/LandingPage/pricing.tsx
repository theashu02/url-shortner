"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { Eyebrow } from "./eyebrow";
import { EASE, fadeUpItem, staggerContainer } from "./motion-variants";

const MONTHLY_PRICE = 12;
const YEARLY_PRICE = 9;

const freeFeatures = [
  "25 links / month",
  "Standard analytics",
  "Generic minilink.co domain",
];

const proFeatures = [
  "5,000 links / month",
  "Advanced analytics",
  "Custom domains",
  "API access",
  "Priority support",
];

type Billing = "monthly" | "yearly";

function BillingToggle({ billing, onChange }: { billing: Billing; onChange: (billing: Billing) => void }) {
  const options: { value: Billing; label: string; badge?: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly", badge: "-25%" },
  ];

  return (
    <div role="group" aria-label="Billing period" className="inline-flex border border-border bg-card p-1 shadow-sm">
      {options.map((option) => {
        const active = billing === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`relative px-5 py-2 text-sm font-semibold transition-colors ${
              active ? "text-on-btn" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="billing-thumb"
                className="absolute inset-0 bg-btn"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center">
              {option.label}
              {option.badge && (
                <span className="ml-2 bg-lime-soft px-1.5 py-0.5 text-[11px] font-bold text-on-lime">
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const proPrice = billing === "yearly" ? YEARLY_PRICE : MONTHLY_PRICE;

  return (
    <section id="pricing" aria-label="Pricing plans" className="py-20 md:py-24 px-4 md:px-8 bg-mist">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4 tracking-tight leading-tight">
              Simple, transparent <span className="text-ember">pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start free. Upgrade only when you need more.
            </p>
            <BillingToggle billing={billing} onChange={setBilling} />
          </div>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch"
        >

          {/* Free Plan */}
          <motion.div variants={fadeUpItem} className="h-full">
            <div className="bg-card border border-border p-6 md:p-8 rounded-none shadow-sm flex flex-col hover:border-ember transition-colors duration-300 h-full">
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground tracking-tight mb-1">Free</h3>
                <p className="text-muted-foreground">Perfect for personal projects and testing.</p>
                <div className="mt-6 mb-6 flex items-baseline text-5xl font-display font-bold text-foreground">
                  $0
                  <span className="ml-2 text-lg text-muted-foreground font-medium">/mo</span>
                </div>
              </div>

              <ul className="space-y-4 flex-1 mb-8">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-foreground font-medium">
                    <span className="bg-lime-soft p-1.5 rounded-none shrink-0"><Check className="h-4 w-4 text-on-lime" /></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                nativeButton={false}
                render={<Link href="/auth" />}
                className="h-12 w-full rounded-none border border-border bg-btn font-semibold text-on-btn hover:bg-ember hover:text-on-ember"
              >
                Get started for free
              </Button>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div variants={fadeUpItem} className="h-full">
            <div className="bg-lake border border-border p-6 md:p-8 rounded-none shadow-md flex flex-col relative h-full">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-inkband text-on-inkband text-xs font-semibold px-4 py-1.5 rounded-none border border-border">
                Recommended
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-on-lake tracking-tight mb-1">Pro</h3>
                <p className="text-on-lake/80">For professionals and growing teams.</p>
                <div className="mt-6 mb-1 flex items-baseline text-5xl font-display font-bold text-on-lake overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={proPrice}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -24, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      {`$${proPrice}`}
                    </motion.span>
                  </AnimatePresence>
                  <span className="ml-2 text-lg text-on-lake/60 font-medium">/mo</span>
                </div>
                <p className="mb-6 text-sm text-on-lake/60 h-5">
                  {billing === "yearly" ? "Billed annually ($108/year)" : "Billed monthly"}
                </p>
              </div>

              <ul className="space-y-4 flex-1 mb-8">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-on-lake font-medium">
                    <span className="bg-inkband/10 p-1.5 rounded-none shrink-0"><Check className="h-4 w-4 text-on-lake" /></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                nativeButton={false}
                render={<Link href="/auth" />}
                className="h-12 w-full rounded-none border border-border bg-btn font-semibold text-on-btn hover:opacity-90"
              >
                Upgrade to Pro
              </Button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
