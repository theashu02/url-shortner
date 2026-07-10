"use client";

import { Button } from '@/components/ui/button';
import { useFetchApi } from '@/hooks/useFetchApi';
import { api } from '@/lib/eden';

export default function DashboardPage() {
  const { data: response, error, loading, execute } = useFetchApi<string>();

  const handleFetchHello = () => {
    execute(() => api.hello.get());
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-8 flex flex-col items-start gap-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold font-heading text-[#4a044e]">Dashboard</h1>
        <p className="text-zinc-600 mt-2">Test your Elysia + Next.js Integration</p>
      </div>
      
      <Button 
        onClick={handleFetchHello} 
        disabled={loading}
        className="bg-[#e0f2fe] text-zinc-900 hover:bg-[#bae6fd] shadow-none border border-[#bae6fd]/50 font-medium"
      >
        {loading ? 'Calling...' : 'Call Elysia API'}
      </Button>

      {response && (
        <div className="p-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl shadow-sm">
          <p className="text-sm font-mono text-zinc-800">Response: {response}</p>
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
