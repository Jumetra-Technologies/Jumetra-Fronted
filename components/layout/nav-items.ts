import {
  BarChart3,
  Beaker,
  Boxes,
  Cpu,
  FileText,
  FlaskConical,
  Home,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

/** Canonical app navigation — shared by sidebar and workspace chrome. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workspace", label: "Projects", icon: Boxes },
  { href: "/laboratory/workspace", label: "Laboratory", icon: Beaker, primary: true },
  { href: "/firmware", label: "Firmware", icon: Cpu },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/dashboard", label: "Research Overview", icon: LayoutDashboard },
  { href: "/hybrid", label: "Hybrid Bridge", icon: Workflow },
];

/** Compact header links for the engineering workspace. */
export const WORKSPACE_NAV_ITEMS = NAV_ITEMS.filter((item) =>
  [
    "/",
    "/workspace",
    "/laboratory/workspace",
    "/firmware",
    "/experiments",
    "/marketplace",
    "/analytics",
    "/settings",
  ].includes(item.href),
);
