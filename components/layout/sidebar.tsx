"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

function NavLinks({
  activePath,
  onNavigate,
  collapsed = false,
}: {
  activePath: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const items = collapsed ? NAV_ITEMS.slice(0, 8) : NAV_ITEMS;
  return (
    <nav
      className={cn(
        "flex flex-1 flex-col gap-1",
        collapsed ? "items-center p-2" : "p-3",
      )}
      aria-label="Primary"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? activePath === "/"
            : activePath === item.href || activePath.startsWith(`${item.href}/`);
        if (collapsed) {
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-sm)]"
                : item.primary
                  ? "text-sky-300 hover:bg-white/5"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span>{item.label}</span>
            {item.primary ? (
              <span className="ml-auto rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">★</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  activePath,
  collapsed = false,
  onNavigate,
}: {
  activePath: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  if (collapsed) {
    return (
      <aside className="hidden w-16 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center justify-center border-b border-white/10 py-4">
          <span className="text-xs font-bold tracking-widest text-white">H</span>
        </div>
        <NavLinks activePath={activePath} collapsed />
        <div className="p-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-full text-sidebar-muted hover:bg-white/5 hover:text-white"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
          HHIP
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Engineering Platform</h1>
      </div>
      <NavLinks activePath={activePath} onNavigate={onNavigate} />
      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-muted hover:bg-white/5 hover:text-white"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </aside>
  );
}

export function DashboardShell({
  activePath,
  children,
}: {
  activePath: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 shadow-[var(--shadow-sm)]">
        <Button
          size="icon"
          variant="ghost"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="hidden lg:inline-flex"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            HHIP
          </span>
          <span className="hidden text-sm font-semibold sm:inline">Engineering Platform</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/laboratory/workspace">
            <Button size="sm">Open Laboratory</Button>
          </Link>
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <Sidebar activePath={activePath} collapsed={collapsed} />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full shadow-[var(--shadow-md)]">
              <div className="absolute right-3 top-3 z-20">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-sidebar-foreground hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Sidebar activePath={activePath} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
