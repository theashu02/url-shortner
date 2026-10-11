import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "./scroll-reveal";

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-auto bg-mist text-foreground px-4 py-14 md:px-8 border-t border-border"
    >
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-display font-bold text-3xl text-foreground tracking-tight" aria-label="SimpLx — Go to homepage">
                SimpLx
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Short links, big impact. Enterprise-grade URL shortening built for speed.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ember mb-4">Product</h4>
              <nav aria-label="Product links">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="#features" className="hover:text-ember-deep transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-ember-deep transition-colors">Pricing</Link></li>
                  <li><Link href="#api" className="hover:text-ember-deep transition-colors">API</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ember mb-4">Resources</h4>
              <nav aria-label="Resource links">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-ember-deep transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-ember-deep transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-ember-deep transition-colors">Support</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ember mb-4">Legal</h4>
              <nav aria-label="Legal links">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-ember-deep transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-ember-deep transition-colors">Terms of Service</Link></li>
                </ul>
              </nav>
            </div>
          </div>
        </ScrollReveal>

        <Separator className="bg-border" />

        <ScrollReveal delay={100}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SimpLx Inc. All rights reserved.</p>
            <p className="opacity-60">
              SimpLx can make mistakes. Please verify links before sharing sensitive data.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
