"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-6 z-50 mx-auto w-full max-w-5xl px-4 md:px-6">
      <div className="flex h-14 items-center justify-between rounded-full border border-white/40 bg-white/60 px-6 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight text-[#4a044e]">
            SimpLx
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
            Pricing
          </Link>
          <Link href="#api" className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
            API
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900">
            Login
          </Button>
          <Button className="bg-[#e0f2fe] text-zinc-900 hover:bg-[#bae6fd] shadow-none border border-[#bae6fd]/50 font-medium">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-zinc-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-4 right-4 top-20 rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur-xl shadow-lg md:hidden flex flex-col gap-4">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 hover:text-zinc-950 px-2 py-1">
            Features
          </Link>
          <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 hover:text-zinc-950 px-2 py-1">
            Pricing
          </Link>
          <Link href="#api" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 hover:text-zinc-950 px-2 py-1">
            API
          </Link>
          <div className="h-px w-full bg-zinc-200 my-1" />
          <Button variant="ghost" className="w-full justify-start text-sm font-medium">
            Login
          </Button>
          <Button className="w-full bg-[#e0f2fe] text-zinc-900 hover:bg-[#bae6fd] shadow-none border border-[#bae6fd]/50 font-medium">
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
