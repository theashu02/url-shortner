"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SIDEBAR_ROUTES, type SidebarRoute } from "./sidebarData";
import { SidebarTip } from "./sidebarTip";

function SidebarNavItem({
  route,
  active,
  collapsed,
}: {
  route: SidebarRoute;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarTip label={route.name} collapsed={collapsed}>
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={route.href} aria-current={active ? "page" : undefined} />}
        className={cn(
          "relative h-10 w-full gap-3 px-3 text-sm font-medium",
          collapsed && "justify-center px-0",
          !collapsed && "justify-start",
          active
            ? "bg-inkband text-on-inkband hover:bg-inkband hover:text-on-inkband"
            : "text-muted-foreground hover:bg-mist hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 bg-ember transition-opacity",
            active ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
        <route.icon
          className={cn("h-5 w-5 shrink-0", active && "text-ember")}
          aria-hidden="true"
        />
        {!collapsed && <span className="truncate">{route.name}</span>}
      </Button>
    </SidebarTip>
  );
}

interface SidebarNavProps {
  pathname: string | null;
  collapsed: boolean;
}

export function SidebarNav({ pathname, collapsed }: SidebarNavProps) {
  return (
    <>
      <div className="px-3 pt-4">
        <SidebarTip label="Create new link" collapsed={collapsed}>
          <Button
            nativeButton={false}
            render={<Link href="/appv1/custom-links" />}
            className={cn(
              "h-10 w-full gap-2 rounded-none bg-ember text-sm font-bold text-on-ember hover:bg-ember/90",
              collapsed && "justify-center px-0",
            )}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">New link</span>}
          </Button>
        </SidebarTip>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Menu
          </p>
        )}
        {SIDEBAR_ROUTES.map((route) => (
          <SidebarNavItem
            key={route.href}
            route={route}
            active={pathname?.startsWith(route.href) ?? false}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </>
  );
}
