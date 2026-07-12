"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {mode === "register" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Your Name</label>
          <Input
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleInputChange("name")}
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
          onChange={handleInputChange("email")}
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
          onChange={handleInputChange("password")}
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
        onClick={clearError}
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
