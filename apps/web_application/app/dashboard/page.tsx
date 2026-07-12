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
    <div className="min-h-screen bg-[#f8f6f2] p-8 flex flex-col items-start gap-6 font-sans">
      <div className="flex items-center justify-between w-full max-w-xl">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[#4a044e]">Dashboard</h1>
          <p className="text-zinc-600 mt-2">Welcome to your dashboard</p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2 text-zinc-600 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Button
        onClick={handleFetchUser}
        disabled={loading}
        className="bg-[#4a044e] text-white hover:bg-[#4a044e]/90 gap-2 font-medium"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Fetching..." : "Fetch My Info"}
      </Button>

      {user && (
        <div className="w-full max-w-xl p-6 bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "Avatar"} width={30} height={30} className="h-14 w-14 rounded-full border-2 border-[#4a044e]/20" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[#4a044e]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[#4a044e]" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-zinc-900">{user.name ?? "—"}</p>
              <p className="text-sm text-zinc-500 capitalize">{user.provider} account</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-700">
              <Mail className="h-4 w-4 text-zinc-400" />
              <span>{user.email ?? "—"}</span>
              {user.emailVerified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
            {user.country && (
              <div className="flex items-center gap-2 text-zinc-700">
                <Globe className="h-4 w-4 text-zinc-400" />
                <span>{user.country}</span>
              </div>
            )}
            {user.bio && <p className="text-zinc-600 italic">&quot;{user.bio}&quot;</p>}
          </div>

          <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-3 text-xs text-zinc-500">
            <div>Login count: <span className="font-medium text-zinc-700">{user.loginCount}</span></div>
            <div>Last login: <span className="font-medium text-zinc-700">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—"}</span></div>
            <div>Handle: <span className="font-medium text-zinc-700">{user.handle ?? "Not set"}</span></div>
            <div>Joined: <span className="font-medium text-zinc-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span></div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-xl shadow-sm">
          <p className="text-sm font-mono text-red-600">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
