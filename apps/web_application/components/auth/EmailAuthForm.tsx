"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveRight } from "lucide-react";
import { useEmailAuth } from "@/hooks/useEmailAuth";

function EmailAuthFormContent() {
  const {
    form,
    mode,
    error,
    loading,
    handleInputChange,
    clearError,
    handleSubmit,
  } = useEmailAuth();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-name" className="text-xs font-bold uppercase tracking-widest text-foreground">Your Name</Label>
          <Input
            id="auth-name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleInputChange("name")}
            required
            autoComplete="name"
            className="h-13 text-lg md:text-xl px-4 rounded-none border-2 border-border bg-background"
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="auth-email" className="text-xs font-bold uppercase tracking-widest text-foreground">Email Address</Label>
        <Input
          id="auth-email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleInputChange("email")}
          required
          autoComplete="email"
          className="h-13 text-lg md:text-lg px-4 rounded-none border-2 border-border bg-background"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="auth-password" className="text-xs font-bold uppercase tracking-widest text-foreground">Password</Label>
        <Input
          id="auth-password"
          type="password"
          placeholder="Min 8 characters"
          value={form.password}
          onChange={handleInputChange("password")}
          required
          minLength={8}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="h-13 text-lg md:text-xl px-4 rounded-none border-2 border-border bg-background"
        />
      </div>

      {error && (
        <p role="alert" className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full h-auto py-3.5 gap-2 text-sm bg-btn text-on-btn hover:bg-ember hover:text-on-ember rounded-none border-2 border-border font-bold tracking-widest uppercase">
        {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        <MoveRight className="h-4 w-4" strokeWidth={2.5} />
      </Button>

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={mode === "signin" ? "/auth?mode=register" : "/auth?mode=signin"} onClick={clearError} />}
        className="w-full h-auto border-2 border-border bg-card py-3.5 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-lake hover:text-on-lake"
      >
        {mode === "signin" ? "Need an account? Register" : "Already have an account? Sign In"}
      </Button>
    </form>
  );
}

export function EmailAuthForm() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-5 w-full" aria-hidden="true">
        <Skeleton className="h-13 rounded-none border-2 border-border bg-muted" />
        <Skeleton className="h-13 rounded-none border-2 border-border bg-muted" />
        <Skeleton className="h-14 rounded-none border-2 border-border bg-muted" />
      </div>
    }>
      <EmailAuthFormContent />
    </Suspense>
  );
}
