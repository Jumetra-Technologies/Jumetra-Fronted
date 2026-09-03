"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { BoardHealthBadge } from "./BoardHealthBadge";
import type { WorkspaceHardwareNode } from "./hardware-types";
import { Button } from "@/components/ui/button";

export function HardwareExplorer({
  onSelect,
  selectedId,
}: {
  onSelect?: (node: WorkspaceHardwareNode) => void;
  selectedId?: string | null;
}) {
  const [nodes, setNodes] = useState<WorkspaceHardwareNode[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await api.listWorkspaceHardware();
      setNodes((res.hardware || []) as WorkspaceHardwareNode[]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hardware");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 3000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Hardware</span>
        <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]" onClick={() => void refresh()}>
          Refresh
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[10px]"
          onClick={() => void api.reconnectWorkspaceHardware({})}
        >
          Reconnect
        </Button>
      </div>
      {error && <p className="px-2 py-1 text-[10px] text-danger">{error}</p>}
      <ul className="flex-1 overflow-auto p-1">
        {nodes.length === 0 && (
          <li className="px-2 py-3 text-[11px] text-muted">No hardware nodes yet. Plug in a board to auto-discover.</li>
        )}
        {nodes.map((n) => (
          <li key={n.device_id}>
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-muted-bg ${
                selectedId === n.device_id ? "bg-accent" : ""
              }`}
              onClick={() => onSelect?.(n)}
            >
              <span className="truncate font-medium">{n.label || n.board_type}</span>
              <BoardHealthBadge health={n.health} status={n.status} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
