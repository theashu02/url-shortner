import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart2, Globe, QrCode, Terminal, Shield } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Lightning Fast Redirection",
      description: "Powered by ElysiaJS and Redis edge caching for sub-millisecond responses globally.",
      icon: <Zap className="h-5 w-5 text-primary" />,
    },
    {
      title: "Advanced Analytics",
      description: "Real-time geographic, device, browser, OS, and referrer tracking at your fingertips.",
      icon: <BarChart2 className="h-5 w-5 text-primary" />,
    },
    {
      title: "Custom Domains",
      description: "Build brand trust with custom branded domains like l.yourbrand.com for every link.",
      icon: <Globe className="h-5 w-5 text-primary" />,
    },
    {
      title: "Dynamic QR Codes",
      description: "Secure, instant QR generation with downloadable PNGs. Perfect for offline marketing.",
      icon: <QrCode className="h-5 w-5 text-primary" />,
    },
    {
      title: "Developer API",
      description: "Secure API keys with simple REST endpoints for seamless integration into your apps.",
      icon: <Terminal className="h-5 w-5 text-primary" />,
    },
    {
      title: "Enterprise Security",
      description: "Rate limiting, DDoS protection, and password-protected links keep your routing secure.",
      icon: <Shield className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <section id="features" className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Everything you need. <br className="md:hidden" />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="bg-card/45 backdrop-blur-md border border-border/40 shadow-sm hover:bg-card/75 transition-colors rounded-none"
            >
              <CardHeader className="pb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-none mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-heading text-lg font-bold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
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
