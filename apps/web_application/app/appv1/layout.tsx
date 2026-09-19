import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/appv1/header";

export default function AppV1Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
