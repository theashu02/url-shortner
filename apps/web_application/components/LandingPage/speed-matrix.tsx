import React from "react";
import { ArrowRight, Database, Activity, User, ExternalLink } from "lucide-react";

export function SpeedMatrix() {
  return (
    <section className="py-24 px-4 md:px-6 bg-card/25 border-y border-border/10">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <div className="flex-1 md:pr-10">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Why are we faster?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              We separate link creation from redirection. Redirect requests are served directly from Redis with sub-10ms 302 responses while analytics are processed asynchronously, ensuring every click remains extremely fast regardless of traffic volume.
            </p>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="flex flex-col gap-4 relative">
              {/* Connecting line */}
              <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-primary/20" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-none bg-card border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div className="bg-card/65 backdrop-blur-sm border border-border/40 p-4 rounded-none shadow-sm flex-1">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">User Click</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-none bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <Database className="h-5 w-5" />
                </div>
                <div className="bg-card/65 backdrop-blur-sm border border-border/40 p-4 rounded-none shadow-sm flex-1">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">Redis Edge Cache</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Sub-10ms lookup</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="bg-card/65 backdrop-blur-sm border border-border/40 p-4 rounded-none shadow-sm flex-1 flex justify-between items-center">
                  <div>
                    <p className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">302 Redirect</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Instant delivery</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10 ml-7">
                <div className="absolute -left-11 top-1/2 w-8 h-0.5 bg-border border-l border-b border-transparent" />
                <div className="w-10 h-10 rounded-none bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="bg-card/45 backdrop-blur-sm border border-border/40 p-3 rounded-none flex-1">
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-wider text-foreground/80">Async Analytics</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
