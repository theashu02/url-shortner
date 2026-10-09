"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { EASE } from "./motion-variants";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#api", label: "API" },
];

export function NavbarMobile() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="flex items-center gap-4 md:hidden relative z-50">
        <ThemeToggle />
        <Button
          nativeButton={false}
          render={<Link href="/auth" />}
          className="h-9 rounded-none border border-line bg-btn px-4 text-xs font-semibold text-on-btn hover:bg-ember hover:text-on-ember"
        >
          Start
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="h-9 w-9 rounded-none border border-line bg-card text-foreground hover:bg-foreground hover:text-background"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-40 bg-mist flex flex-col pt-24 px-6 gap-6"
          >
            {LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.07, duration: 0.35, ease: EASE }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-semibold text-foreground tracking-tight border-b border-line pb-4"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + LINKS.length * 0.07, duration: 0.35, ease: EASE }}
              className="mt-8"
            >
              <Button
                nativeButton={false}
                render={<Link href="/auth" onClick={() => setMobileMenuOpen(false)} />}
                className="h-12 w-full rounded-none border border-line bg-btn font-semibold text-on-btn hover:bg-ember hover:text-on-ember"
              >
                Login
              </Button>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
