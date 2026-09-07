"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  /** Compact single-track control for the collapsed sidebar rail. */
  compact?: boolean;
};

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        "relative grid grid-cols-2 rounded-[10px] border border-white/10 bg-white/5 p-1",
        compact ? "w-full" : "w-full",
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[8px] bg-white/15 shadow-[var(--shadow-sm)]"
        animate={{ x: isDark ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      />
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Light mode"
        className={cn(
          "relative z-10 flex h-8 items-center justify-center gap-1.5 rounded-[8px] text-xs font-medium transition-colors",
          theme === "light" ? "text-white" : "text-sidebar-muted hover:text-white/80",
        )}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden />
        {compact ? null : <span>Light</span>}
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark mode"
        className={cn(
          "relative z-10 flex h-8 items-center justify-center gap-1.5 rounded-[8px] text-xs font-medium transition-colors",
          theme === "dark" ? "text-white" : "text-sidebar-muted hover:text-white/80",
        )}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden />
        {compact ? null : <span>Dark</span>}
      </button>
    </div>
  );
}
