import { redirect } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { getServerAuthSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AuthPage() {
  const session = await getServerAuthSession();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen">
      {/* LEFT 65% - ENTERPRISE STATUS / GLANCE */}
      <div className="hidden lg:flex lg:w-[65%] relative bg-zinc-950 items-center justify-center p-16 overflow-hidden border-r border-zinc-900">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        
        {/* Subtle glowing lights */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-purple-950/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-cyan-950/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl space-y-12">
          {/* Brand/Product Logo or Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] tracking-widest text-[#eac2ff] font-mono">
              <span className="w-1.5 h-1.5 bg-[#eac2ff] animate-pulse" />
              SYSTEM ACTIVE // REGION: GLOBAL
            </div>
            <h2 className="font-heading text-5xl xl:text-6xl font-bold tracking-tight text-white leading-none">
              The Edge <br />
              Routing Platform.
            </h2>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed font-sans">
              Deploy secure, analytics-tracked short links instantly. Powered by Redis Edge and fully optimized for low-latency delivery.
            </p>
          </div>

          {/* Code/Terminal Mockup */}
          <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 p-6 space-y-4 font-mono text-xs text-zinc-400 shadow-2xl rounded-none">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-zinc-800" />
                <span className="w-2.5 h-2.5 bg-zinc-800" />
                <span className="w-2.5 h-2.5 bg-zinc-800" />
              </div>
              <span className="text-[10px] tracking-wider text-zinc-600">EDGE_ROUTER.SH</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-zinc-600">{"// Redirecting: shrt.run/x72j -> example.com/long-destination"}</div>
              <div><span className="text-zinc-500">$</span> curl -I https://shrt.run/x72j</div>
              <div className="text-emerald-400 font-semibold">HTTP/2 302 Found</div>
              <div>Location: <span className="text-cyan-400">https://example.com/long-destination</span></div>
              <div>X-Routing-Time: <span className="text-emerald-400 font-semibold">1.84ms</span></div>
              <div>X-Cache: <span className="text-emerald-400 font-semibold">HIT (Redis Edge)</span></div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-850">
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-white">99.99%</div>
              <div className="text-[10px] tracking-wider uppercase text-zinc-500 font-mono">Service SLA</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-white">&lt; 10ms</div>
              <div className="text-[10px] tracking-wider uppercase text-zinc-500 font-mono">Avg Redirect</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-white">12.4M</div>
              <div className="text-[10px] tracking-wider uppercase text-zinc-500 font-mono">Reroutes / Mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT 35% - AUTH CARD */}
      <div className="flex w-full lg:w-[35%] items-center justify-center bg-background px-6 py-12 lg:px-12">
        <Card className="w-full max-w-md border-0 dark:border-0 bg-transparent dark:bg-transparent rounded-none shadow-none ring-0 p-2">
          <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
            <CardTitle className="text-3xl font-bold font-heading tracking-tight text-primary dark:text-zinc-50">Great to see you!</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs tracking-wide">
              Please enter your details to sign in or create an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleButton />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-background px-3 text-zinc-400">Or continue with email</span>
              </div>
            </div>

            <EmailAuthForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
