"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NavbarMobile } from "./navbar-mobile";
import { EASE } from "./motion-variants";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 flex items-center justify-between transition-[background-color,border-color,padding] duration-300 ${
        scrolled
          ? "border-b border-border bg-mist/90 backdrop-blur-md py-4"
          : "border-b border-transparent bg-transparent py-6"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 relative z-50 text-foreground" aria-label="SimpLx — Go to homepage">
        <span className="font-display font-bold text-2xl uppercase tracking-widest">
          SimpLx
        </span>
      </Link>

      {/* Desktop Actions — server-rendered for SEO crawlability */}
      <div className="hidden items-center gap-3 md:flex relative z-50">
        <nav aria-label="Primary navigation" className="bg-card border border-border divide-x divide-line flex rounded-none shadow-sm">
          <Link href="#features" className="text-sm font-medium text-foreground hover:bg-ember hover:text-on-ember transition-colors px-5 py-2.5">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-foreground hover:bg-ember hover:text-on-ember transition-colors px-5 py-2.5">
            Pricing
          </Link>
          <Button
            nativeButton={false}
            render={<Link href="/auth" />}
            className="h-auto rounded-none bg-btn px-5 py-2.5 text-sm font-semibold text-on-btn hover:bg-ember hover:text-on-ember"
          >
            Get Started
          </Button>
        </nav>
        <ThemeToggle />
      </div>
      <NavbarMobile />
    </motion.header>
  );
}
