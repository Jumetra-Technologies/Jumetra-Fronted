"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2" role="group" aria-label="Color theme">
      <Button
        type="button"
        variant={theme === "light" ? "default" : "secondary"}
        onClick={() => setTheme("light")}
        className={cn("flex-1")}
        aria-pressed={theme === "light"}
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "secondary"}
        onClick={() => setTheme("dark")}
        className={cn("flex-1")}
        aria-pressed={theme === "dark"}
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
    </div>
  );
}
