import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-zinc-500">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg shadow-zinc-200/30 flex flex-col">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-zinc-900">Free</CardTitle>
              <CardDescription>Perfect for personal projects and testing.</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-[#4a044e]">
                $0
                <span className="ml-1 text-xl font-medium text-zinc-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 text-sm text-zinc-600">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>25 links / month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Standard analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Generic minilink.co domain</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full h-12 bg-white hover:bg-zinc-50 border-zinc-200 font-semibold">
                Get Started for Free
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-[#4a044e] text-white shadow-xl shadow-[#4a044e]/20 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#eac2ff] text-[#4a044e] text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Pro</CardTitle>
              <CardDescription className="text-zinc-300">For professionals and growing teams.</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $12
                <span className="ml-1 text-xl font-medium text-zinc-300">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 text-sm text-zinc-200">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#eac2ff] shrink-0" />
                  <span className="font-medium text-white">5,000 links / month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#eac2ff] shrink-0" />
                  <span className="font-medium text-white">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#eac2ff] shrink-0" />
                  <span className="font-medium text-white">Custom domains</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#eac2ff] shrink-0" />
                  <span className="font-medium text-white">API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#eac2ff] shrink-0" />
                  <span className="font-medium text-white">Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12 bg-[#e0f2fe] text-[#4a044e] hover:bg-white font-semibold">
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </section>
  );
}
