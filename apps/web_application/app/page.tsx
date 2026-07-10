'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, BarChart2, Zap, Shield, Copy, Check, ArrowRight } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortened, setShortened] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setShortened(true);
    setCopied(false);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">MiniLink</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">Features</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">Pricing</a>
            <div className="w-px h-4 bg-border hidden md:block"></div>
            <ModeToggle />
            <Button variant="ghost" size="sm">Log in</Button>
            <Button size="sm">Sign up</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-4 pt-20 pb-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8 mb-24">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            MiniLink 2.0 is now live
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter max-w-3xl">
            Short links, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">big results</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            A powerful URL shortener that helps you manage, track, and optimize your links. 
            Build your brand and engage your audience with every click.
          </p>

          {/* URL Input Form */}
          <div className="w-full max-w-2xl mt-8">
            <Card className="shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 border-border/50">
              <CardContent className="p-2">
                {!shortened ? (
                  <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <Input 
                        type="url" 
                        placeholder="Paste your long link here..." 
                        required
                        className="pl-10 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    <Button type="submit" size="lg" className="h-14 px-8 shrink-0">
                      Shorten Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-2">
                    <div className="flex-1 truncate px-4 py-2 bg-secondary/50 rounded-md font-mono text-sm">
                      minilink.co/x7y9z
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" className="flex-1 sm:flex-none h-12" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button variant="secondary" className="flex-1 sm:flex-none h-12" onClick={() => { setShortened(false); setUrl(''); }}>
                        New
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            By clicking Shorten Now, you agree to our Terms of Service.
          </p>
        </section>

        {/* Features Section */}
        <section className="py-12 border-t border-border/40">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our globally distributed edge network ensures your links redirect instantly, anywhere in the world.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Deep Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track clicks, referrers, and geolocations in real-time. Make data-driven decisions for your campaigns.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Enterprise Secure</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced link filtering and automatic malware scanning keeps your audience safe from malicious destinations.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-8">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-muted-foreground" />
            <span className="font-heading font-semibold text-muted-foreground">MiniLink</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MiniLink Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
