"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODES = [
  "HIGH",
  "LOW",
  "INPUT",
  "OUTPUT",
  "PWM",
  "PULLUP",
  "PULLDOWN",
  "ANALOG",
] as const;

export function PinModeEditor({
  mode,
  onChange,
  disabled,
}: {
  mode?: string;
  onChange: (mode: string) => void;
  disabled?: boolean;
}) {
  const current = (mode || "").toUpperCase();
  return (
    <div className="flex flex-wrap gap-1">
      {MODES.map((m) => (
        <Button
          key={m}
          type="button"
          size="sm"
          variant={current === m ? "default" : "ghost"}
          disabled={disabled}
          className={cn("h-6 px-2 text-[10px]", current === m && "ring-1 ring-primary")}
          onClick={() => onChange(m)}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}
