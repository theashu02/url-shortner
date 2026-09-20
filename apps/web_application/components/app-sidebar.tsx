"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Link as LinkIcon,
  Wand2,
  Menu,
  LogOut,
} from "lucide-react";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50 border-r">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="bg-background/80 backdrop-blur-md shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-background md:bg-transparent transition-all duration-300 ease-in-out shrink-0 border-r",
          isCollapsed ? "md:w-16" : "md:w-52",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center h-16 px-4">
          <div
            className={cn(
              "flex items-center gap-2 font-semibold overflow-hidden transition-all duration-300",
              isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            )}
          >
            <span className="tracking-widest pl-2">Shorty</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex ml-auto shrink-0 hover:bg-accent text-muted-foreground"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {routes.map((route) => {
            const isActive = pathname?.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 transition-colors group relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <route.icon
                  className={cn("h-5 w-5 text-foreground shrink-0 transition-colors", isActive && "text-primary")}
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300 text-sm text-foreground",
                    isCollapsed ? "md:hidden" : "block"
                  )}
                >
                  {route.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive group",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title={isCollapsed ? "Back to Home" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:text-destructive transition-colors" />
            <span
              className={cn(
                "truncate font-medium transition-all duration-300",
                isCollapsed ? "md:hidden" : "block"
              )}
            >
              Back to Home
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}