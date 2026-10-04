import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

export function Pricing() {
  return (
    <section id="pricing" aria-label="Pricing plans" className="py-32 px-4 md:px-8 bg-mist">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-24">
            <h2 className="font-display font-bold text-5xl md:text-8xl text-foreground mb-6 uppercase tracking-tighter leading-[0.9]">
              SIMPLE, TRANSPARENT <br />
              <span className="text-ember">PRICING</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Free Plan */}
          <ScrollReveal delay={100}>
            <div className="bg-card border-4 border-line p-8 rounded-none flex flex-col hover:border-ember transition-all duration-300 shadow-hard h-full">
              <div>
                <h3 className="font-display font-bold text-4xl text-foreground uppercase tracking-wider mb-2">Free</h3>
                <p className="text-muted-foreground font-bold">Perfect for personal projects and testing.</p>
                <div className="mt-8 mb-8 flex items-baseline text-6xl font-display font-bold text-foreground">
                  $0
                  <span className="ml-2 text-xl text-muted-foreground tracking-normal font-bold font-sans">/mo</span>
                </div>
              </div>

              <ul className="space-y-6 flex-1 mb-10">
                <li className="flex items-center gap-4 text-foreground font-bold text-lg">
                  <div className="bg-lime-soft p-1 rounded-none"><Check className="h-5 w-5 text-on-lime" /></div>
                  25 links / month
                </li>
                <li className="flex items-center gap-4 text-foreground font-bold text-lg">
                  <div className="bg-lime-soft p-1 rounded-none"><Check className="h-5 w-5 text-on-lime" /></div>
                  Standard analytics
                </li>
                <li className="flex items-center gap-4 text-foreground font-bold text-lg">
                  <div className="bg-lime-soft p-1 rounded-none"><Check className="h-5 w-5 text-on-lime" /></div>
                  Generic minilink.co domain
                </li>
              </ul>

              <Button
                nativeButton={false}
                render={<Link href="/auth" />}
                className="h-16 w-full rounded-none border-4 border-line bg-btn text-lg font-bold uppercase tracking-wider text-on-btn hover:bg-ember hover:text-on-ember"
              >
                Get Started for Free
              </Button>
            </div>
          </ScrollReveal>

          {/* Pro Plan */}
          <ScrollReveal delay={200}>
            <div className="bg-lake border-4 border-line p-8 rounded-none flex flex-col relative transform md:-translate-y-4 shadow-hard h-full">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-inkband text-on-inkband text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-none border-2 border-line">
                Recommended
              </div>
              <div>
                <h3 className="font-display font-bold text-4xl text-on-lake uppercase tracking-wider mb-2">Pro</h3>
                <p className="text-on-lake/80 font-bold">For professionals and growing teams.</p>
                <div className="mt-8 mb-8 flex items-baseline text-6xl font-display font-bold text-on-lake">
                  $12
                  <span className="ml-2 text-xl text-on-lake/60 tracking-normal font-bold font-sans">/mo</span>
                </div>
              </div>

              <ul className="space-y-6 flex-1 mb-10">
                <li className="flex items-center gap-4 text-on-lake font-bold text-lg">
                  <div className="bg-inkband/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-lake" /></div>
                  5,000 links / month
                </li>
                <li className="flex items-center gap-4 text-on-lake font-bold text-lg">
                  <div className="bg-inkband/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-lake" /></div>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-4 text-on-lake font-bold text-lg">
                  <div className="bg-inkband/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-lake" /></div>
                  Custom domains
                </li>
                <li className="flex items-center gap-4 text-on-lake font-bold text-lg">
                  <div className="bg-inkband/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-lake" /></div>
                  API access
                </li>
                <li className="flex items-center gap-4 text-on-lake font-bold text-lg">
                  <div className="bg-inkband/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-lake" /></div>
                  Priority support
                </li>
              </ul>

              <Button
                nativeButton={false}
                render={<Link href="/auth" />}
                className="h-16 w-full rounded-none border-4 border-line bg-btn text-lg font-bold uppercase tracking-wider text-on-btn hover:opacity-90"
              >
                Upgrade to Pro
              </Button>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
