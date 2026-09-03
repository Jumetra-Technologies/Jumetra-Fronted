"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BoardHealthBadge } from "./BoardHealthBadge";
import { ConnectionOverlay } from "./ConnectionOverlay";
import { HardwarePins } from "./HardwarePins";
import { PIN_COLORS, type HardwarePin, type WorkspaceHardwareNode } from "./hardware-types";
import { cn } from "@/lib/utils";

const BOARD_FILL: Record<string, string> = {
  arduino: "linear-gradient(145deg, #00979d 0%, #007a7e 55%, #00666a 100%)",
  esp: "linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 50%, #111 100%)",
  stm: "linear-gradient(160deg, #1e3a5f 0%, #0f2744 100%)",
  pico: "linear-gradient(160deg, #6b7280 0%, #4b5563 100%)",
  pi: "linear-gradient(160deg, #6cc24a 0%, #3d8b2e 100%)",
  generic: "linear-gradient(160deg, #334155 0%, #1e293b 100%)",
};

function boardFamily(boardType: string): keyof typeof BOARD_FILL {
  const b = boardType.toLowerCase();
  if (b.includes("arduino")) return "arduino";
  if (b.includes("esp32") || b.includes("esp8266")) return "esp";
  if (b.includes("stm32") || b.includes("blue")) return "stm";
  if (b.includes("pico")) return "pico";
  if (b.includes("raspberry") || b.includes("pi-4") || b.includes("pi4")) return "pi";
  return "generic";
}

function PinHotspot({
  pin,
  onSelect,
}: {
  pin: HardwarePin;
  onSelect?: (pin: HardwarePin) => void;
}) {
  const kind = (pin.type || pin.pin_type || "GPIO").toUpperCase();
  const color = PIN_COLORS[kind] || PIN_COLORS.GPIO;
  const logic = (pin.state?.logic || pin.state?.state || "").toUpperCase();

  return (
    <button
      type="button"
      className={cn(
        "absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-black/30",
        logic === "PWM" && "animate-pulse",
        kind === "UART" && "animate-ping",
      )}
      style={{
        left: `${(pin.x ?? 0.5) * 100}%`,
        top: `${(pin.y ?? 0.5) * 100}%`,
        backgroundColor: color,
        boxShadow: logic === "HIGH" ? `0 0 10px ${color}` : undefined,
        opacity: logic === "LOW" ? 0.45 : 1,
      }}
      title={`${pin.name} (${kind})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(pin);
      }}
    />
  );
}

function HardwareNodeView({
  node,
  selected,
  onSelect,
  onPinSelect,
}: {
  node: WorkspaceHardwareNode;
  selected?: boolean;
  onSelect?: (node: WorkspaceHardwareNode) => void;
  onPinSelect?: (pin: HardwarePin) => void;
}) {
  const [expanded, setExpanded] = useState(!node.collapsed);
  const pins = node.pins || [];
  const family = useMemo(() => boardFamily(node.board_type), [node.board_type]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative select-none rounded-lg border bg-surface shadow-sm",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
      style={{ width: 280, transform: `rotate(${node.rotation || 0}deg)` }}
      onClick={() => onSelect?.(node)}
    >
      <ConnectionOverlay node={node} />
      <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
        <span className="truncate text-xs font-semibold">{node.label || node.board_type}</span>
        <BoardHealthBadge health={node.health} status={node.status} />
        <button
          type="button"
          className="ml-auto text-[10px] text-muted"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="relative mx-2 my-2 h-[120px] overflow-hidden rounded-md">
        <div
          className="absolute inset-2 rounded-md shadow-inner"
          style={{ background: BOARD_FILL[family] }}
        />
        <div className="absolute left-[42%] top-0.5 z-[2] h-2.5 w-9 rounded-sm bg-slate-400" title="USB" />
        {family === "arduino" && (
          <div className="absolute right-[18%] top-1 z-[2] h-3.5 w-3.5 rounded-full bg-neutral-900" title="Power" />
        )}
        {pins.map((p) => (
          <PinHotspot key={p.name} pin={p} onSelect={onPinSelect} />
        ))}
      </div>

      {expanded && (
        <div className="border-t border-border px-2.5 py-2">
          <div className="mb-1 font-mono text-[10px] text-muted">
            {node.transport || "serial"} · {node.endpoint || node.port || "—"}
          </div>
          <HardwarePins pins={pins.slice(0, 24)} onPinClick={onPinSelect} />
          {pins.length > 24 && (
            <p className="mt-1 text-[10px] text-muted">+{pins.length - 24} more pins</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export const HardwareNode = memo(HardwareNodeView);
