import { ArrowRight, Database, Activity, User, ExternalLink } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function SpeedMatrix() {
  return (
    <section className="py-32 px-4 md:px-8 bg-mist relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          <div className="flex-1">
            <ScrollReveal>
              <h2 className="font-display font-bold text-5xl md:text-7xl text-foreground mb-8 uppercase tracking-tighter leading-[0.9]">
                WHY ARE WE<br />
                <span className="text-lake">FASTER?</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                We separate link creation from redirection. Redirect requests are served directly from Redis with sub-10ms 302 responses while analytics are processed asynchronously, ensuring every click remains extremely fast regardless of traffic volume.
              </p>
            </ScrollReveal>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="flex flex-col gap-6 relative">
              {/* Connecting line */}
              <div className="absolute left-9 top-10 bottom-10 w-1 bg-line/15" />

              <ScrollReveal delay={100}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-19 h-19 rounded-none bg-ember flex items-center justify-center text-on-ember shrink-0 shadow-2xl">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="bg-card border-2 border-line p-5 rounded-none shadow-hard-sm flex-1">
                    <p className="font-display font-bold text-xl uppercase tracking-wider text-foreground">User Click</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-19 h-19 rounded-none bg-lake flex items-center justify-center text-on-lake shrink-0 shadow-2xl">
                    <Database className="h-8 w-8" />
                  </div>
                  <div className="bg-card border-2 border-line p-5 rounded-none shadow-hard-sm flex-1">
                    <p className="font-display font-bold text-xl uppercase tracking-wider text-foreground">Redis Edge Cache</p>
                    <p className="text-sm text-muted-foreground font-bold font-mono mt-1">Sub-10ms lookup</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-19 h-19 rounded-none bg-lime-soft border-2 border-line flex items-center justify-center text-on-lime shrink-0 shadow-2xl">
                    <ExternalLink className="h-8 w-8" />
                  </div>
                  <div className="bg-card border-2 border-line p-5 rounded-none shadow-hard-sm flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-display font-bold text-xl uppercase tracking-wider text-foreground">302 Redirect</p>
                      <p className="text-sm text-muted-foreground font-bold font-mono mt-1">Instant delivery</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="flex items-center gap-6 relative z-10 ml-9.5">
                  <div className="absolute -left-12 top-1/2 w-12 h-1 bg-line/15" />
                  <div className="w-15 h-15 rounded-none bg-ember-deep flex items-center justify-center text-on-ember shrink-0 shadow-2xl">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="bg-card border-2 border-line p-4 rounded-none shadow-hard-sm flex-1">
                    <p className="font-display font-bold text-lg uppercase tracking-wider text-foreground">Async Analytics</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
