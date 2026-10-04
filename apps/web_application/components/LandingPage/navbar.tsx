import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NavbarMobile } from "./navbar-mobile";

export function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-6 md:px-8 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 relative z-50 text-foreground" aria-label="SimpLx — Go to homepage">
        <span className="font-display font-bold text-2xl uppercase tracking-widest">
          SimpLx
        </span>
      </Link>

      {/* Desktop Actions — server-rendered for SEO crawlability */}
      <div className="hidden items-center gap-3 md:flex relative z-50">
        <nav aria-label="Primary navigation" className="bg-card border-2 border-line divide-x-2 divide-line flex">
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
      <NavbarMobile />
    </header>
  );
}
