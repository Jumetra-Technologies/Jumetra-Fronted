"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { signalColor } from "@/lib/hardware/signal-colors";
import { useUIStore } from "@/stores/ui-store";

function SignalEdgeComponent({
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
  const hoveredEdge = useUIStore((s) => s.hoveredEdgeId);
  const setHoveredEdge = useUIStore((s) => s.setHoveredEdgeId);
  const protocol = (data?.protocol as string) ?? "digital";
  const valid = data?.valid !== false;
  const color = (data?.color as string) ?? signalColor(protocol);
  const highlighted = selected || hoveredEdge === id;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: highlighted ? 3.5 : 2.5,
          strokeDasharray: valid ? undefined : "6 4",
          opacity: valid ? 1 : 0.65,
          filter: highlighted ? "drop-shadow(0 0 4px rgba(37,99,235,0.4))" : undefined,
          transition: "stroke-width 0.15s ease",
        }}
        interactionWidth={20}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHoveredEdge(id)}
        onMouseLeave={() => setHoveredEdge(null)}
      />
      {label && highlighted ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted shadow-sm"
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const SignalEdge = memo(SignalEdgeComponent);
