"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export type WorkspaceConnection = {
  connection_id: string;
  source_device: string;
  source_pin: string;
  destination_device: string;
  destination_pin: string;
  wire_type?: string;
  wire_color?: string;
  status?: string;
  valid?: boolean;
  latency_ms?: number;
};

export function ConnectionManager({
  workspaceId = "",
  onSelect,
  selectedId,
}: {
  workspaceId?: string;
  onSelect?: (c: WorkspaceConnection) => void;
  selectedId?: string | null;
}) {
  const [items, setItems] = useState<WorkspaceConnection[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await api.listWorkspaceConnections(workspaceId);
      setItems((res.connections || []) as WorkspaceConnection[]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 2500);
    return () => clearInterval(t);
  }, [refresh]);

  async function remove(id: string) {
    await api.deleteWorkspaceConnection(id);
    await refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Connections</span>
        <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]" onClick={() => void refresh()}>
          Refresh
        </Button>
      </div>
      {error && <p className="px-2 py-1 text-[10px] text-danger">{error}</p>}
      <ul className="flex-1 overflow-auto p-1">
        {items.length === 0 && (
          <li className="px-2 py-3 text-[11px] text-muted">
            Drag a pin to another pin to create a live wire.
          </li>
        )}
        {items.map((c) => (
          <li key={c.connection_id}>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1.5 text-[11px] hover:bg-muted-bg ${
                selectedId === c.connection_id ? "bg-accent" : ""
              }`}
            >
              <button type="button" className="min-w-0 flex-1 truncate text-left font-mono" onClick={() => onSelect?.(c)}>
                <span style={{ color: c.wire_color }}>{c.wire_type || "digital"}</span>{" "}
                {c.source_device}:{c.source_pin} → {c.destination_device}:{c.destination_pin}
                {c.status === "waiting" ? " · waiting" : ""}
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 shrink-0 text-[10px] text-danger"
                onClick={() => void remove(c.connection_id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
