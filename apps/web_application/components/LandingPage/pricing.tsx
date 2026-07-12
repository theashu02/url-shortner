import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <Card className="bg-card/45 backdrop-blur-md border border-border/40 shadow-sm flex flex-col rounded-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground">Free</CardTitle>
              <CardDescription>Perfect for personal projects and testing.</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-primary">
                $0
                <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>25 links / month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Standard analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Generic minilink.co domain</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full h-12 rounded-none text-xs uppercase tracking-wider font-semibold border-border bg-transparent hover:bg-muted text-foreground">
                Get Started for Free
              </Button>
            </CardFooter>
          </Card>
 
          {/* Pro Plan */}
          <Card className="bg-primary text-primary-foreground border border-primary/20 shadow-xl shadow-primary/10 flex flex-col relative overflow-hidden rounded-none">
            <div className="absolute top-0 right-0 bg-primary-foreground text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-none">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary-foreground">Pro</CardTitle>
              <CardDescription className="text-primary-foreground/80">For professionals and growing teams.</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-primary-foreground">
                $12
                <span className="ml-1 text-sm font-medium text-primary-foreground/70">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 text-xs text-primary-foreground/90">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary-foreground shrink-0" />
                  <span className="font-medium">5,000 links / month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary-foreground shrink-0" />
                  <span className="font-medium">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary-foreground shrink-0" />
                  <span className="font-medium">Custom domains</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary-foreground shrink-0" />
                  <span className="font-medium">API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary-foreground shrink-0" />
                  <span className="font-medium">Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12 rounded-none text-xs uppercase tracking-wider font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0">
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>
 
        </div>
      </div>
    </section>
  );
}
