import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-[#f8f6f2] px-4 py-12 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-[#4a044e]">
              SimpLx
            </Link>
            <p className="mt-4 text-sm text-zinc-500">
              Short links, big impact. Enterprise-grade URL shortening built for speed.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-zinc-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#features" className="hover:text-zinc-900 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link></li>
              <li><Link href="#api" className="hover:text-zinc-900 transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-zinc-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-zinc-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-zinc-200" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-zinc-500">
          <p>© 2026 SimpLx Inc. All rights reserved.</p>
          <p className="text-zinc-400 italic">
            SimpLx can make mistakes. Please verify links before sharing sensitive data.
          </p>
        </div>
      </div>
    </footer>
  );
}
