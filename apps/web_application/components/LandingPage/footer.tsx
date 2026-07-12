import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/45 bg-background px-4 py-12 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary">
              SimpLx
            </Link>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Short links, big impact. Enterprise-grade URL shortening built for speed.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#api" className="hover:text-foreground transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs uppercase tracking-wider font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-[10px] uppercase tracking-wider text-muted-foreground">
          <p>© 2026 SimpLx Inc. All rights reserved.</p>
          <p className="text-muted-foreground/60 italic lowercase tracking-normal">
            SimpLx can make mistakes. Please verify links before sharing sensitive data.
          </p>
        </div>
      </div>
    </footer>
  );
}
