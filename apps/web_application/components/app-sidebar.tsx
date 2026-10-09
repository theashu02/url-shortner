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
  Moon,
  Sun,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useAppDispatch } from "@/store";
import { setProfileModalOpen } from "@/store/profile-slice";
import { ProfileModal } from "@/components/appv1/profile-modal";

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
  const { setTheme } = useTheme();
  const dispatch = useAppDispatch();

  // Close mobile sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="border border-border bg-card rounded-none shadow-2xs"
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
          "fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-card transition-all duration-300 ease-in-out shrink-0 border-r border-border",
          isCollapsed ? "md:w-16" : "md:w-48",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div
            className={cn(
              "flex items-center gap-2 overflow-hidden transition-all duration-300",
              isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            )}
          >
            <span className="font-display font-bold text-xl uppercase tracking-widest text-foreground pl-2">SimpLx</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex ml-auto shrink-0 text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-none transition-colors group relative text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={isCollapsed ? route.name : undefined}
              >
                <route.icon
                  className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
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
        <div className="p-3 flex flex-col gap-1 border-t border-border">
          <button
            type="button"
            onClick={() => dispatch(setProfileModalOpen(true))}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition-colors text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground group outline-none cursor-pointer",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title={isCollapsed ? "Profile" : undefined}
          >
            <User className="h-5 w-5 shrink-0 transition-colors group-hover:text-foreground" />
            <span
              className={cn(
                "truncate transition-all duration-300 text-left",
                isCollapsed ? "md:hidden" : "block"
              )}
            >
              Profile
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition-colors text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground group outline-none",
                isCollapsed && "md:justify-center md:px-0"
              )}
              title={isCollapsed ? "Toggle Theme" : undefined}
            >
              <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
                <Sun className="h-5 w-5 transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
              </div>
              <span
                className={cn(
                  "truncate transition-all duration-300 text-left",
                  isCollapsed ? "md:hidden" : "block"
                )}
              >
                Theme
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-none transition-colors text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive group",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title={isCollapsed ? "Back to Home" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:text-destructive transition-colors" />
            <span
              className={cn(
                "truncate transition-all duration-300",
                isCollapsed ? "md:hidden" : "block"
              )}
            >
              Log Out
            </span>
          </Link>
        </div>
      </aside>

      <ProfileModal />
    </>
  );
}
