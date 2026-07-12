"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-6 z-50 mx-auto w-full max-w-5xl px-4 md:px-6">
      <div className="flex h-14 items-center justify-between rounded-none border border-border/45 bg-card/70 px-6 backdrop-blur-md shadow-sm text-foreground">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary">
            SimpLx
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#api" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground transition-colors hover:text-foreground">
            API
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-xs uppercase tracking-wider font-semibold">
            Login
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase tracking-wider font-semibold">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-4 right-4 top-20 rounded-none border border-border/45 bg-card/95 p-4 backdrop-blur-xl shadow-lg md:hidden flex flex-col gap-4">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground px-2 py-1">
            Features
          </Link>
          <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground px-2 py-1">
            Pricing
          </Link>
          <Link href="#api" onClick={() => setMobileMenuOpen(false)} className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground px-2 py-1">
            API
          </Link>
          <div className="h-px w-full bg-border my-1" />
          <Button variant="ghost" className="w-full justify-start text-xs uppercase tracking-wider font-semibold">
            Login
          </Button>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase tracking-wider font-semibold">
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
