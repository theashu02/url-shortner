import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Link2 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile logo placeholder if sidebar is hidden on small screens */}
          <Link href="/appv1" className="flex items-center gap-2 font-bold tracking-tight">
            <Link2 className="h-5 w-5 text-primary" />
            <span>ShortLink</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
