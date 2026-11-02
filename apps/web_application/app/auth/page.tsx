import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { getServerAuthSession } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Sign In or Create Your SimpLx Account",
  description:
    "Sign in to SimpLx to create short links with real-time analytics, custom domains, and QR codes. New here? Create a free account in seconds.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthPageProps {
  searchParams: Promise<{ mode?: string | string[] }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const session = await getServerAuthSession();
  if (session?.user) redirect("/appv1/dashboard");

  const params = await searchParams;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isRegister = modeParam === "register";

  return (
    <main className="flex h-dvh overflow-hidden">
      <AuthShowcase />

      <div className="flex h-full w-full flex-col bg-mist lg:w-[45%] xl:w-[40%]">
        {/* Mobile brand bar */}
        <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 border-2 border-border"
            aria-label="Back to SimpLx home"
          >
            <span className="font-display font-bold text-xl uppercase tracking-widest">
              SimpLx
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-ember-deep"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 py-6">
          <Card className="my-auto w-full max-w-md border-4 border-border bg-card p-6 ring-0">
            <CardHeader className="px-0">
              <Badge className="h-auto bg-lake px-3 py-1 font-mono uppercase tracking-widest text-on-lake hover:bg-lake">
                {isRegister ? "Register" : "Sign in"}
              </Badge>
              <CardTitle className="mt-4">
                <h1 className="font-display text-2xl font-bold uppercase leading-[0.9] tracking-tighter text-foreground">
                  {isRegister ? (
                    <>
                      JOIN <span className="text-lake">SIMPLX</span>
                    </>
                  ) : (
                    <>
                      WELCOME <span className="text-ember-deep">BACK</span>
                    </>
                  )}
                </h1>
              </CardTitle>
            </CardHeader>

            <CardContent className="px-0 pt-2">
              <GoogleButton />

              <div className="my-6 flex items-center gap-4" aria-hidden="true">
                <Separator className="h-0.5 flex-1 bg-line/20" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Or with email
                </span>
                <Separator className="h-0.5 flex-1 bg-line/20" />
              </div>

              <EmailAuthForm />
            </CardContent>
          </Card>
        </div>

        {/* Accent base */}
        <div className="flex h-9 shrink-0 overflow-hidden" aria-hidden="true">
          <div className="h-full w-1/3 bg-ember border-t-4 border-r-4 border-border" />
          <div className="h-full w-1/3 bg-lime-soft border-t-4 border-r-4 border-border" />
          <div className="h-full w-1/3 bg-lake border-t-4 border-border" />
        </div>
      </div>
    </main>
  );
}
