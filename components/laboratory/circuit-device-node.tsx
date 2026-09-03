"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { HardwareIcon } from "./hardware-icons";
import { cn } from "@/lib/utils";

export type CircuitDeviceNodeData = {
  label: string;
  componentId: string;
  isController: boolean;
  isActive: boolean;
};

function CircuitDeviceNodeView({ data }: NodeProps) {
  const { label, componentId, isController, isActive } = data as unknown as CircuitDeviceNodeData;

  return (
    <div
      className={cn(
        "flex w-[104px] flex-col items-center gap-1 rounded-[10px] border bg-white/90 p-2 text-center shadow-sm backdrop-blur transition-all dark:bg-zinc-900/90",
        isActive ? "border-blue-500 shadow-[0_0_14px_rgba(37,99,235,0.35)]" : "border-zinc-300 dark:border-zinc-700",
        isController ? "ring-1 ring-blue-200 dark:ring-blue-900" : "",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400" />
      <HardwareIcon componentId={componentId} active={isActive} className="h-12 w-12 drop-shadow-sm" />
      <div className="w-full">
        <p className="truncate text-[11px] font-semibold leading-tight">{label}</p>
        <p className="truncate text-[9px] uppercase tracking-wide text-muted">{componentId}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400" />
    </div>
  );
}

export const CircuitDeviceNode = memo(CircuitDeviceNodeView);