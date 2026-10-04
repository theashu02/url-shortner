import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "./scroll-reveal";

export function Footer() {
  return (
    <footer className="mt-auto bg-mist text-foreground px-4 py-16 md:px-8 border-t-2 border-line">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">

            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-display font-bold text-4xl text-foreground uppercase tracking-tighter">
                SimpLx
              </Link>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-bold">
                Short links, big impact. Enterprise-grade URL shortening built for speed.
              </p>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase tracking-wider text-ember mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="#features" className="hover:text-ember-deep transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-ember-deep transition-colors">Pricing</Link></li>
                <li><Link href="#api" className="hover:text-ember-deep transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase tracking-wider text-ember mb-6">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="#" className="hover:text-ember-deep transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-ember-deep transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-ember-deep transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase tracking-wider text-ember mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="#" className="hover:text-ember-deep transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-ember-deep transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <Separator className="bg-border" />

        <ScrollReveal delay={100}>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <p>© 2026 SimpLx Inc. All rights reserved.</p>
            <p className="normal-case tracking-normal opacity-60">
              SimpLx can make mistakes. Please verify links before sharing sensitive data.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
