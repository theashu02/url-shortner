"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Link as LinkIcon, Wand2, ChevronLeft, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const routes = [
  { name: "Dashboard", href: "/appv1/dashboard", icon: LayoutDashboard },
  { name: "My Links", href: "/appv1/my-links", icon: LinkIcon },
  { name: "Custom Links", href: "/appv1/custom-links", icon: Wand2 },
  { name: "Analytics", href: "/appv1/analytics", icon: LineChart },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(true)} className="bg-background shadow-sm border-border">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 ease-in-out shrink-0",
          "w-64",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border/50">
          <div className={cn("flex items-center gap-2 font-bold text-lg overflow-hidden transition-all", isCollapsed ? "md:opacity-0 md:w-0" : "opacity-100")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <LinkIcon className="h-4 w-4" />
            </div>
            <span className="truncate whitespace-nowrap tracking-tight">Shorty</span>
          </div>
          
          {/* Mobile Close Button */}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="md:hidden text-sidebar-foreground shrink-0">
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop Collapse Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {routes.map((route) => {
            const isActive = pathname?.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <route.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground")} />
                
                <span className={cn("truncate font-medium transition-all duration-300", isCollapsed ? "md:opacity-0 md:w-0 md:hidden" : "opacity-100")}>
                  {route.name}
                </span>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border/50">
           <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive group",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? "Back to Home" : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0 transition-colors group-hover:text-destructive" />
                <span className={cn("truncate font-medium transition-all duration-300", isCollapsed ? "md:opacity-0 md:w-0 md:hidden" : "opacity-100")}>
                  Back to Home
                </span>
           </Link>
        </div>
      </aside>
    </>
  );
}
