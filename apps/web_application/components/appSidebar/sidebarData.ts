import {
  LayoutDashboard,
  LineChart,
  Link as LinkIcon,
  Monitor,
  Moon,
  Sun,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export interface SidebarRoute {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const SIDEBAR_ROUTES: SidebarRoute[] = [
  { name: "Dashboard", href: "/appv1/dashboard", icon: LayoutDashboard },
  { name: "My Links", href: "/appv1/my-links", icon: LinkIcon },
  { name: "Custom Links", href: "/appv1/custom-links", icon: Wand2 },
  { name: "Analytics", href: "/appv1/analytics", icon: LineChart },
];

export const SIDEBAR_THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;
