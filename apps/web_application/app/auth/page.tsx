import { redirect } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { getServerAuthSession } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AuthPage() {
  const session = await getServerAuthSession();
  if (session?.user) redirect("/appv1/dashboard");

  return (
    <main className="flex min-h-screen h-screen">
      <div className="hidden lg:flex lg:w-[65%] relative bg-muted/40 items-center justify-center p-16 overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="absolute top-1/4 left-1/4 w-125 h-75 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-62.5 bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border text-[10px] tracking-widest text-secondary-foreground font-mono">
              <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
              SYSTEM ACTIVE // REGION: GLOBAL
            </div>
            <h2 className="font-heading text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-none">
              The Edge <br />
              Routing Platform.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Deploy secure, analytics-tracked short links instantly. Powered by
              Redis Edge and fully optimized for low-latency delivery.
            </p>
          </div>

          <div className="bg-card/70 backdrop-blur border border-border p-6 space-y-4 font-mono text-xs text-card-foreground shadow-2xl rounded-none">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-muted-foreground/30" />
                <span className="w-2.5 h-2.5 bg-muted-foreground/30" />
                <span className="w-2.5 h-2.5 bg-muted-foreground/30" />
              </div>
              <span className="text-[10px] tracking-wider text-muted-foreground">
                EDGE_ROUTER.SH
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-muted-foreground">
                {
                  "// Redirecting: shrt.run/x72j -> example.com/long-destination"
                }
              </div>
              <div>
                <span className="text-muted-foreground">$</span> curl -I
                https://shrt.run/x72j
              </div>
              <div className="text-primary font-semibold">
                HTTP/2 302 Found
              </div>
              <div>
                Location:{" "}
                <span className="text-primary">
                  https://example.com/long-destination
                </span>
              </div>
              <div>
                X-Routing-Time:{" "}
                <span className="text-primary font-semibold">1.84ms</span>
              </div>
              <div>
                X-Cache:{" "}
                <span className="text-primary font-semibold">
                  HIT (Redis Edge)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-foreground">
                99.99%
              </div>
              <div className="text-[10px] tracking-wider uppercase text-muted-foreground font-mono">
                Service SLA
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-foreground">
                &lt; 10ms
              </div>
              <div className="text-[10px] tracking-wider uppercase text-muted-foreground font-mono">
                Avg Redirect
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-foreground">
                12.4M
              </div>
              <div className="text-[10px] tracking-wider uppercase text-muted-foreground font-mono">
                Reroutes / Mo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-[35%] items-center justify-center bg-background px-6 py-12 lg:px-12">
        <Card className="w-full max-w-md border-0 bg-transparent rounded-none shadow-none ring-0 p-2">
          <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
            <CardTitle className="text-3xl font-bold font-heading tracking-tight text-foreground">
              Great to see you!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs tracking-wide">
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
                <span className="bg-background px-3 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <EmailAuthForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
