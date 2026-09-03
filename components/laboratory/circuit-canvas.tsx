"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function CircuitCanvas({
  nodes,
  edges,
}: {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
}) {
  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: String(n.id),
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
          border: "1px solid #d4d4d8",
          borderRadius: 8,
          padding: 8,
          background: n.type === "controller" ? "#eff6ff" : "#fff",
          minWidth: 120,
        },
      })),
    [nodes],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
        label: e.label ? String(e.label) : undefined,
      })),
    [edges],
  );

  const onInit = useCallback(() => {}, []);

  if (!flowNodes.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-[12px] border border-dashed border-border text-sm text-muted">
        Create a laboratory to visualize the circuit
      </div>
    );
  }

  return (
    <div className="h-96 rounded-[12px] border border-border">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onInit={onInit}
        fitView
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
