"use client";

import type { CSSProperties } from "react";
import type { HardwarePin } from "./hardware-types";
import { PIN_COLORS } from "./hardware-types";
import { cn } from "@/lib/utils";

export function PinBadge({
  pin,
  size = "sm",
  onClick,
}: {
  pin: HardwarePin;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const kind = (pin.type || pin.pin_type || "GPIO").toUpperCase();
  const color = PIN_COLORS[kind] || PIN_COLORS.GPIO;
  const logic = (pin.state?.logic || pin.state?.state || "UNKNOWN").toUpperCase();
  const isHigh = logic === "HIGH";
  const isPwm = logic === "PWM" || kind === "PWM";

  const style: CSSProperties = {
    borderColor: color,
    color,
    backgroundColor: `${color}18`,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${pin.name} (${kind})`}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 font-mono transition-shadow",
        size === "sm" ? "text-[10px] py-0.5" : "text-xs py-1",
        isHigh && "shadow-md",
        isPwm && "animate-pulse",
      )}
      style={style}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          logic === "LOW" && "opacity-40",
          kind === "UART" && "animate-ping",
        )}
        style={{ backgroundColor: color }}
      />
      {pin.name}
    </button>
  );
}
