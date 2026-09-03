"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

const WIRE_COLORS: Record<string, string> = {
  power: "#dc2626",
  ground: "#111827",
  digital: "#2563eb",
  analog: "#16a34a",
  pwm: "#7c3aed",
  uart: "#ea580c",
  spi: "#ea580c",
  i2c: "#ea580c",
  communication: "#ea580c",
  hybrid: "#2563eb",
};

/** Animated SVG live wire for React Flow (Sprint 30). */
function LiveWireComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  selected,
}: EdgeProps) {
  const protocol = String((data?.wire_type as string) || (data?.protocol as string) || "digital");
  const color = String((data?.wire_color as string) || (data?.color as string) || WIRE_COLORS[protocol] || WIRE_COLORS.digital);
  const valid = data?.valid !== false;
  const signalHigh = Boolean(data?.signal_high);
  const highlighted = Boolean(selected || data?.highlighted);
  const waiting = data?.status === "waiting";

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  const dash =
    protocol === "power" || protocol === "ground"
      ? undefined
      : protocol === "pwm"
        ? "2 4"
        : protocol === "analog"
          ? "4 8"
          : "8 6";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: highlighted || signalHigh ? 3.5 : 2.5,
          strokeDasharray: valid ? dash : "6 4",
          opacity: waiting ? 0.55 : valid ? 1 : 0.65,
          filter: signalHigh ? `drop-shadow(0 0 6px ${color})` : highlighted ? `drop-shadow(0 0 4px ${color}88)` : undefined,
        }}
        interactionWidth={22}
      />
      {dash && valid && !waiting ? (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4 12"
          opacity={0.85}
          className="hn-wire-flow"
          style={{ animation: "hn-wire-flow 1s linear infinite" }}
        />
      ) : null}
      {(label || highlighted) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted shadow-sm"
          >
            {String(label || protocol)}
            {waiting ? " · waiting" : ""}
          </div>
        </EdgeLabelRenderer>
      )}
      <style>{`
        @keyframes hn-wire-flow {
          to { stroke-dashoffset: -16; }
        }
      `}</style>
    </>
  );
}

export const LiveWire = memo(LiveWireComponent);
