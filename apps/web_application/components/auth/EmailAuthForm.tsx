"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveRight } from "lucide-react";

function EmailAuthFormContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "signin";
  
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("email-password", {
      email: form.email,
      password: form.password,
      name: form.name,
      isRegister: mode === "register" ? "true" : "false",
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      setError(
        mode === "register"
          ? "Registration failed. Email may already be in use."
          : "Invalid email or password. If you signed up with Google, use that instead."
      );
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {mode === "register" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Your Name</label>
          <Input
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            className="h-10 text-sm px-3 rounded-none"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Email Address</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
          className="h-10 text-sm px-3 rounded-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Password</label>
        <Input
          type="password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={8}
          className="h-10 text-sm px-3 rounded-none"
        />
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      <Button type="submit" disabled={loading} size="lg" className="w-full h-10 gap-2 text-xs sm:text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-none border-0 font-semibold tracking-wider uppercase mt-2">
        {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        <MoveRight className="h-4 w-4" />
      </Button>

      <Link
        href={mode === "signin" ? "/auth?mode=register" : "/auth?mode=signin"}
        onClick={() => setError(null)}
        className="text-xs text-primary hover:underline font-semibold tracking-wide text-center block"
      >
        {mode === "signin" ? "Need an account? Register" : "Already have an account? Sign In"}
      </Link>
    </form>
  );
}

export function EmailAuthForm() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4 w-full animate-pulse">
        <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-none" />
        <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-none" />
        <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded-none mt-2" />
      </div>
    }>
      <EmailAuthFormContent />
    </Suspense>
  );
}
