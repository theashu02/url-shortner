import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart2, Globe, QrCode, Terminal, Shield } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Lightning Fast Redirection",
      description: "Powered by ElysiaJS and Redis edge caching for sub-millisecond responses globally.",
      icon: <Zap className="h-6 w-6 text-[#4a044e]" />,
      color: "bg-[#eac2ff]/30"
    },
    {
      title: "Advanced Analytics",
      description: "Real-time geographic, device, browser, OS, and referrer tracking at your fingertips.",
      icon: <BarChart2 className="h-6 w-6 text-[#e0f2fe]" />,
      color: "bg-[#4a044e]/80"
    },
    {
      title: "Custom Domains",
      description: "Build brand trust with custom branded domains like l.yourbrand.com for every link.",
      icon: <Globe className="h-6 w-6 text-[#4a044e]" />,
      color: "bg-[#e0f2fe]/60"
    },
    {
      title: "Dynamic QR Codes",
      description: "Secure, instant QR generation with downloadable PNGs. Perfect for offline marketing.",
      icon: <QrCode className="h-6 w-6 text-[#4a044e]" />,
      color: "bg-[#eac2ff]/30"
    },
    {
      title: "Developer API",
      description: "Secure API keys with simple REST endpoints for seamless integration into your apps.",
      icon: <Terminal className="h-6 w-6 text-[#4a044e]" />,
      color: "bg-[#e0f2fe]/60"
    },
    {
      title: "Enterprise Security",
      description: "Rate limiting, DDoS protection, and password-protected links keep your routing secure.",
      icon: <Shield className="h-6 w-6 text-[#e0f2fe]" />,
      color: "bg-[#4a044e]/80"
    },
  ];

  return (
    <section id="features" className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-4">
            Everything you need. <br className="md:hidden" />
            <span className="text-zinc-500">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="bg-white/40 backdrop-blur-md border-white/60 shadow-lg shadow-zinc-200/30 hover:bg-white/60 transition-colors"
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="font-heading text-xl font-bold text-zinc-950">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
