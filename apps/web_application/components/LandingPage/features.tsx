import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart2, Globe, QrCode, Terminal, Shield } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function Features() {
  const features = [
    {
      title: "Lightning Fast Redirection",
      description: "Powered by ElysiaJS and Redis edge caching for sub-millisecond responses globally.",
      icon: <Zap className="h-8 w-8 text-on-ember" />,
      color: "bg-ember",
    },
    {
      title: "Advanced Analytics",
      description: "Real-time geographic, device, browser, OS, and referrer tracking at your fingertips.",
      icon: <BarChart2 className="h-8 w-8 text-on-lake" />,
      color: "bg-lake",
    },
    {
      title: "Custom Domains",
      description: "Build brand trust with custom branded domains like l.yourbrand.com for every link.",
      icon: <Globe className="h-8 w-8 text-on-lime" />,
      color: "bg-lime-soft",
    },
    {
      title: "Dynamic QR Codes",
      description: "Secure, instant QR generation with downloadable PNGs. Perfect for offline marketing.",
      icon: <QrCode className="h-8 w-8 text-on-ember" />,
      color: "bg-ember",
    },
    {
      title: "Developer API",
      description: "Secure API keys with simple REST endpoints for seamless integration into your apps.",
      icon: <Terminal className="h-8 w-8 text-on-lake" />,
      color: "bg-lake",
    },
    {
      title: "Enterprise Security",
      description: "Rate limiting, DDoS protection, and password-protected links keep your routing secure.",
      icon: <Shield className="h-8 w-8 text-on-lime" />,
      color: "bg-lime-soft",
    },
  ];

  return (
    <section id="features" className="py-32 px-4 md:px-8 bg-mist relative overflow-hidden">

      <div className="container mx-auto max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-24">
            <h2 className="font-display font-bold text-5xl md:text-8xl text-foreground mb-6 uppercase tracking-tighter leading-[0.9]">
              EVERYTHING YOU NEED.<br />
              <span className="text-ember-deep">NOTHING YOU DON&apos;T.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <Card
                className="bg-card border-2 border-line hover:border-ember transition-all duration-300 rounded-none overflow-hidden group hover:-translate-y-2 shadow-hard"
              >
                <CardHeader className="pb-4 relative overflow-hidden">
                  <div className={`w-16 h-16 rounded-none flex items-center justify-center mb-6 shadow-none transform group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="font-heading text-2xl font-bold text-foreground uppercase tracking-wider">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
