"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart2, Globe, QrCode, Terminal, Shield } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { Eyebrow } from "./eyebrow";
import { fadeUpItem, popItem, staggerContainer } from "./motion-variants";

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

const FEATURES: Feature[] = [
  {
    title: "Lightning-fast redirects",
    description: "Powered by ElysiaJS and Redis edge caching for sub-millisecond responses globally.",
    icon: <Zap className="h-6 w-6 text-on-ember" />,
    color: "bg-ember",
  },
  {
    title: "Advanced analytics",
    description: "Real-time geographic, device, browser, OS, and referrer tracking at your fingertips.",
    icon: <BarChart2 className="h-6 w-6 text-on-lake" />,
    color: "bg-lake",
  },
  {
    title: "Custom domains",
    description: "Build brand trust with custom branded domains like l.yourbrand.com for every link.",
    icon: <Globe className="h-6 w-6 text-on-lime" />,
    color: "bg-lime-soft",
  },
  {
    title: "Dynamic QR codes",
    description: "Secure, instant QR generation with downloadable PNGs. Perfect for offline marketing.",
    icon: <QrCode className="h-6 w-6 text-on-ember" />,
    color: "bg-ember",
  },
  {
    title: "Developer API",
    description: "Secure API keys with simple REST endpoints for seamless integration into your apps.",
    icon: <Terminal className="h-6 w-6 text-on-lake" />,
    color: "bg-lake",
  },
  {
    title: "Enterprise security",
    description: "Rate limiting, DDoS protection, and password-protected links keep your routing secure.",
    icon: <Shield className="h-6 w-6 text-on-lime" />,
    color: "bg-lime-soft",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const [hovering, setHovering] = useState(false);
  const reduce = useReducedMotion();
  const glow = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--ember) 14%, transparent), transparent 70%)`;

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.25 }}
      onMouseMove={(event) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="h-full"
    >
      <div ref={cardRef} className="relative h-full">
        <Card className="bg-card border border-line hover:border-ember hover:shadow-md transition-colors duration-300 rounded-none overflow-hidden group h-full relative">
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0"
              style={{ background: glow }}
              animate={{ opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <CardHeader className="pb-3 relative z-10">
            <motion.div
              variants={popItem}
              className={`w-12 h-12 rounded-none flex items-center justify-center mb-4 ${feature.color} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105`}
            >
              {feature.icon}
            </motion.div>
            <CardTitle className="font-heading text-xl font-semibold text-foreground tracking-tight">
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" aria-label="Product features" className="py-20 md:py-24 px-4 md:px-8 bg-mist relative overflow-hidden">

      <div className="container mx-auto max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <Eyebrow>Features</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4 tracking-tight leading-tight">
              Everything you need.{" "}
              <span className="text-ember-deep">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              One simple toolkit for creating, sharing, and measuring short links.
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
