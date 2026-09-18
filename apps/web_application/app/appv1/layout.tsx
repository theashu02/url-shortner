import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppV1Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Render child pages */}
        {children}
      </main>
    </div>
  );
}
