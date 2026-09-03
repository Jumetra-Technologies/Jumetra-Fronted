"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function AnimatedCircuitCanvas({
  nodes,
  edges,
  activeNodeIds = [],
}: {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  activeNodeIds?: string[];
}) {
  const activeSet = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);

  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => {
        const id = String(n.id);
        const isActive = activeSet.has(id);
        const isController = n.type === "controller";
        return {
          id,
          type: "default",
          position: {
            x: Number((n.position as Record<string, number>)?.x ?? 0),
            y: Number((n.position as Record<string, number>)?.y ?? 0),
          },
          data: {
            label: (
              <div className="text-xs">
                <div className="font-semibold">{String(n.label)}</div>
                {n.component_id ? (
                  <div className="text-muted">{String(n.component_id)}</div>
                ) : null}
              </div>
            ),
          },
          style: {
            border: isActive ? "2px solid #2563eb" : "1px solid #d4d4d8",
            borderRadius: 8,
            padding: 8,
            background: isController ? "#eff6ff" : isActive ? "#dbeafe" : "#fff",
            minWidth: 120,
            boxShadow: isActive ? "0 0 12px rgba(37,99,235,0.35)" : undefined,
            transition: "all 0.3s ease",
          },
        };
      }),
    [nodes, activeSet],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => {
        const targetActive = activeSet.has(String(e.target));
        return {
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
          label: e.label ? String(e.label) : undefined,
          animated: targetActive,
          style: targetActive ? { stroke: "#2563eb", strokeWidth: 2 } : undefined,
        };
      }),
    [edges, activeSet],
  );

  if (!flowNodes.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-[12px] border border-dashed border-border text-sm text-muted">
        No circuit data available
      </div>
    );
  }

  return (
    <div className="h-96 rounded-[12px] border border-border">
      <ReactFlow nodes={flowNodes} edges={flowEdges} fitView nodesConnectable={false}>
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
