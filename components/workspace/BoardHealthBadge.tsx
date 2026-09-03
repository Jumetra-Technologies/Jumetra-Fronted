"use client";

import { cn } from "@/lib/utils";

export function BoardHealthBadge({
  health,
  status,
}: {
  health?: string;
  status?: string;
}) {
  const s = (status || health || "unknown").toLowerCase();
  const tone =
    s === "ok" || s === "online"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/40"
      : s === "waiting"
        ? "bg-amber-500/15 text-amber-700 border-amber-500/40"
        : s === "offline" || s === "error"
          ? "bg-red-500/15 text-red-600 border-red-500/40"
          : "bg-muted-bg text-muted border-border";

  const label =
    s === "waiting" ? "Waiting for hardware" : status || health || "unknown";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium", tone)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          s === "online" || s === "ok" ? "bg-emerald-500 animate-pulse" : "bg-current",
        )}
      />
      {label}
    </span>
  );
}
