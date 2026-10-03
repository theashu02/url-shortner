import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4 md:px-8 bg-chakra-ink">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-24">
            <h2 className="font-display font-bold text-5xl md:text-8xl text-on-ink mb-6 uppercase tracking-tighter leading-[0.9]">
              SIMPLE, TRANSPARENT <br />
              <span className="text-saffron">PRICING</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Free Plan */}
          <ScrollReveal delay={100}>
            <div className="bg-paper border-4 border-line p-8 rounded-none flex flex-col hover:border-saffron transition-all duration-300 shadow-hard h-full">
              <div>
                <h3 className="font-display font-bold text-4xl text-chakra-ink uppercase tracking-wider mb-2">Free</h3>
                <p className="text-chakra-ink/60 font-bold">Perfect for personal projects and testing.</p>
                <div className="mt-8 mb-8 flex items-baseline text-6xl font-display font-bold text-chakra-ink">
                  $0
                  <span className="ml-2 text-xl text-chakra-ink/60 tracking-normal font-bold font-sans">/mo</span>
                </div>
              </div>

              <ul className="space-y-6 flex-1 mb-10">
                <li className="flex items-center gap-4 text-chakra-ink font-bold text-lg">
                  <div className="bg-india-green p-1 rounded-none"><Check className="h-5 w-5 text-on-green" /></div>
                  25 links / month
                </li>
                <li className="flex items-center gap-4 text-chakra-ink font-bold text-lg">
                  <div className="bg-india-green p-1 rounded-none"><Check className="h-5 w-5 text-on-green" /></div>
                  Standard analytics
                </li>
                <li className="flex items-center gap-4 text-chakra-ink font-bold text-lg">
                  <div className="bg-india-green p-1 rounded-none"><Check className="h-5 w-5 text-on-green" /></div>
                  Generic minilink.co domain
                </li>
              </ul>

              <Button
                render={<Link href="/auth" />}
                className="h-16 w-full rounded-none border-4 border-chakra-ink bg-paper text-lg font-bold uppercase tracking-wider text-chakra-ink hover:bg-chakra-ink hover:text-on-ink"
              >
                Get Started for Free
              </Button>
            </div>
          </ScrollReveal>

          {/* Pro Plan */}
          <ScrollReveal delay={200}>
            <div className="bg-saffron border-4 border-line p-8 rounded-none flex flex-col relative transform md:-translate-y-4 shadow-hard h-full">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-chakra-ink text-on-ink text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-none border-2 border-line">
                Recommended
              </div>
              <div>
                <h3 className="font-display font-bold text-4xl text-on-saffron uppercase tracking-wider mb-2">Pro</h3>
                <p className="text-on-saffron/80 font-bold">For professionals and growing teams.</p>
                <div className="mt-8 mb-8 flex items-baseline text-6xl font-display font-bold text-on-saffron">
                  $12
                  <span className="ml-2 text-xl text-on-saffron/60 tracking-normal font-bold font-sans">/mo</span>
                </div>
              </div>

              <ul className="space-y-6 flex-1 mb-10">
                <li className="flex items-center gap-4 text-on-saffron font-bold text-lg">
                  <div className="bg-chakra-ink/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-saffron" /></div>
                  5,000 links / month
                </li>
                <li className="flex items-center gap-4 text-on-saffron font-bold text-lg">
                  <div className="bg-chakra-ink/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-saffron" /></div>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-4 text-on-saffron font-bold text-lg">
                  <div className="bg-chakra-ink/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-saffron" /></div>
                  Custom domains
                </li>
                <li className="flex items-center gap-4 text-on-saffron font-bold text-lg">
                  <div className="bg-chakra-ink/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-saffron" /></div>
                  API access
                </li>
                <li className="flex items-center gap-4 text-on-saffron font-bold text-lg">
                  <div className="bg-chakra-ink/10 p-1 rounded-none"><Check className="h-5 w-5 text-on-saffron" /></div>
                  Priority support
                </li>
              </ul>

              <Button
                render={<Link href="/auth" />}
                className="h-16 w-full rounded-none border-4 border-chakra-ink bg-chakra-ink text-lg font-bold uppercase tracking-wider text-on-ink hover:bg-chakra-ink/90"
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
