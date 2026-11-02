"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileModal } from "@/components/appv1/profile-modal";
import { SidebarBrand } from "./sidebarBrand";
import { SidebarNav } from "./sidebarNav";
import { SidebarFooter } from "./sidebarFooter";

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-none bg-card shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-52",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBrand
          collapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <SidebarNav pathname={pathname} collapsed={isCollapsed} />
        <SidebarFooter collapsed={isCollapsed} />
      </aside>

      <ProfileModal />
    </TooltipProvider>
  );
}
