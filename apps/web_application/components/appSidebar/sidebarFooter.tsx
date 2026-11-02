"use client";

import { Check, LogOut, Moon, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useAppDispatch } from "@/store";
import { setProfileModalOpen } from "@/store/profile-slice";
import { SIDEBAR_THEMES } from "./sidebarData";
import { SidebarTip } from "./sidebarTip";

function footerButtonClass(collapsed: boolean) {
  return cn(
    "h-10 w-full gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-mist hover:text-foreground",
    collapsed ? "justify-center px-0" : "justify-start",
  );
}

export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-1 border-t border-border p-3">
      <SidebarTip label="Profile" collapsed={collapsed}>
        <Button
          variant="ghost"
          onClick={() => dispatch(setProfileModalOpen(true))}
          className={footerButtonClass(collapsed)}
        >
          <User className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">Profile</span>}
        </Button>
      </SidebarTip>

      <DropdownMenu>
        <SidebarTip label="Theme" collapsed={collapsed}>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className={footerButtonClass(collapsed)} />
            }
          >
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
            {!collapsed && <span className="truncate">Theme</span>}
          </DropdownMenuTrigger>
        </SidebarTip>
        <DropdownMenuContent align="end" className="w-40 rounded-none">
          {SIDEBAR_THEMES.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="text-xs"
            >
              <option.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{option.label}</span>
              {theme === option.value && (
                <Check className="ml-auto h-3.5 w-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <SidebarTip label="Log out" collapsed={collapsed}>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "h-10 w-full gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">Log out</span>}
        </Button>
      </SidebarTip>
    </div>
  );
}
