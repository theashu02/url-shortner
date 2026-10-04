"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-6 md:px-8 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 relative z-50 text-foreground">
        <span className="font-display font-bold text-2xl uppercase tracking-widest">
          SimpLx
        </span>
      </Link>

      {/* Desktop Actions */}
      <div className="hidden items-center gap-3 md:flex relative z-50">
        <nav aria-label="Primary" className="bg-card border-2 border-line divide-x-2 divide-line flex">
          <Link href="#features" className="text-sm font-bold text-foreground hover:bg-ember hover:text-on-ember uppercase tracking-wider transition-colors px-6 py-4">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-bold text-foreground hover:bg-ember hover:text-on-ember uppercase tracking-wider transition-colors px-6 py-4">
            Pricing
          </Link>
          <Button
            nativeButton={false}
            render={<Link href="/auth" />}
            className="h-auto rounded-none bg-btn px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-btn hover:bg-ember hover:text-on-ember"
          >
            Get Started
          </Button>
        </nav>
        <ThemeToggle />
      </div>

      {/* Mobile Toggle */}
      <div className="flex items-center gap-4 md:hidden relative z-50">
        <ThemeToggle />
        <Button
          nativeButton={false}
          render={<Link href="/auth" />}
          className="h-10 rounded-none border-2 border-line bg-btn px-5 text-xs font-bold uppercase tracking-wider text-on-btn hover:bg-ember hover:text-on-ember"
        >
          Start
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="h-10 w-10 rounded-none border-2 border-line bg-card text-foreground hover:bg-foreground hover:text-background"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-mist flex flex-col pt-24 px-6 gap-6">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-bold text-foreground uppercase tracking-tighter border-b-2 border-line pb-4">
            Features
          </Link>
          <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-bold text-foreground uppercase tracking-tighter border-b-2 border-line pb-4">
            Pricing
          </Link>
          <Link href="#api" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-bold text-foreground uppercase tracking-tighter border-b-2 border-line pb-4">
            API
          </Link>
          <div className="mt-8">
            <Button
              nativeButton={false}
              render={<Link href="/auth" onClick={() => setMobileMenuOpen(false)} />}
              className="h-14 w-full rounded-none border-2 border-line bg-btn text-lg font-bold uppercase tracking-wider text-on-btn hover:bg-ember hover:text-on-ember"
            >
              Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
