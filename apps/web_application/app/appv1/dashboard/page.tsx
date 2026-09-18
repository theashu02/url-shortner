"use client";

import { Button } from "@/components/ui/button";
import { useFetchApi } from "@/hooks/useFetchApi";
import { api } from "@/lib/eden";
import { signOut } from "next-auth/react";
import { User, Mail, Globe, LogOut, RefreshCw } from "lucide-react";
import Image from "next/image";

type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  provider: string;
  emailVerified: boolean;
  handle: string | null;
  country: string | null;
  bio: string | null;
  loginCount: number;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export default function DashboardPage() {
  const { data: user, error, loading, execute } = useFetchApi<UserInfo>();

  const handleFetchUser = () => {
    execute(() => api.user.me.get());
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-start gap-6">
      <div className="flex items-center justify-between w-full max-w-xl">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your dashboard</p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Button
        onClick={handleFetchUser}
        disabled={loading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Fetching..." : "Fetch My Info"}
      </Button>

      {user && (
        <div className="w-full max-w-xl p-6 bg-card backdrop-blur-md border border-border rounded-2xl shadow-sm space-y-4 text-card-foreground">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "Avatar"} width={30} height={30} className="h-14 w-14 rounded-full border-2 border-primary/20" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-foreground">{user.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground capitalize">{user.provider} account</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email ?? "—"}</span>
              {user.emailVerified && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
            {user.country && (
              <div className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{user.country}</span>
              </div>
            )}
            {user.bio && <p className="text-muted-foreground italic">&quot;{user.bio}&quot;</p>}
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>Login count: <span className="font-medium text-foreground">{user.loginCount}</span></div>
            <div>Last login: <span className="font-medium text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—"}</span></div>
            <div>Handle: <span className="font-medium text-foreground">{user.handle ?? "Not set"}</span></div>
            <div>Joined: <span className="font-medium text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span></div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 backdrop-blur-md border border-destructive/20 rounded-xl shadow-sm">
          <p className="text-sm font-mono text-destructive">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
