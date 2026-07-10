import React from "react";
import { ArrowRight, Database, Activity, User, ExternalLink } from "lucide-react";

export function SpeedMatrix() {
  return (
    <section className="py-24 px-4 md:px-6 bg-white/40">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <div className="flex-1 md:pr-10">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[#4a044e] mb-6">
              Why are we faster?
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed">
              We separate link creation from redirection. Redirect requests are served directly from Redis with sub-10ms 302 responses while analytics are processed asynchronously, ensuring every click remains extremely fast regardless of traffic volume.
            </p>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="flex flex-col gap-4 relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-[#e0f2fe]" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#e0f2fe] shadow-sm flex items-center justify-center text-zinc-400 shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white p-4 rounded-xl shadow-sm flex-1">
                  <p className="font-heading font-semibold text-zinc-900">User Click</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#4a044e] shadow-md flex items-center justify-center text-white shrink-0">
                  <Database className="h-6 w-6" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white p-4 rounded-xl shadow-sm flex-1">
                  <p className="font-heading font-semibold text-zinc-900">Redis Edge Cache</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Sub-10ms lookup</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#eac2ff]/40 border border-[#eac2ff] flex items-center justify-center text-[#4a044e] shrink-0">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white p-4 rounded-xl shadow-sm flex-1 flex justify-between items-center">
                  <div>
                    <p className="font-heading font-semibold text-zinc-900">302 Redirect</p>
                    <p className="text-xs text-zinc-500 font-mono mt-1">Instant delivery</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300" />
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10 ml-8">
                <div className="absolute -left-12 top-1/2 w-8 h-0.5 bg-zinc-200 border-l border-b border-transparent rounded-bl-lg" />
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-white p-3 rounded-xl flex-1">
                  <p className="font-heading text-sm font-semibold text-zinc-700">Async Analytics</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
