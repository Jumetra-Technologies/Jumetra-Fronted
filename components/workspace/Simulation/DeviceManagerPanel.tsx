"use client";

import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { DeviceMode } from "@/lib/workspace-types";
import { applyWorkspaceSnapshot } from "@/lib/workspace-snapshot";
import { cn } from "@/lib/utils";

const MODES: DeviceMode[] = ["physical", "virtual", "simulator", "hybrid"];

export function DeviceManagerPanel({ workspaceId }: { workspaceId: string }) {
  const devices = useWorkspaceStore((s) => s.nodes);

  async function setMode(id: string, mode: DeviceMode) {
    await api.updateWorkspaceNode(workspaceId, id, {
      device_mode: mode,
      available: mode !== "physical",
    });
    applyWorkspaceSnapshot(await api.getEngineeringWorkspaceState(workspaceId));
  }

  return (
    <div className="space-y-3 bg-surface p-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Device Manager</p>
        <p className="mt-1 text-xs text-muted">Assign physical, virtual, simulator, or hybrid mode.</p>
      </div>
      {devices.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-border bg-canvas p-4 text-xs text-muted">
          No devices on canvas.
        </p>
      ) : (
        devices.map((d) => (
          <div key={d.id} className="rounded-[12px] border border-border bg-canvas p-3 shadow-[var(--shadow-sm)]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{d.label}</p>
                <p className="font-mono text-[11px] text-muted">{d.component_id}</p>
              </div>
              <Badge variant={d.available ? "success" : "warning"}>
                {d.available ? "online" : "missing"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {MODES.map((m) => (
                <label
                  key={m}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-[10px] border px-2 py-1.5 text-xs capitalize transition-colors",
                    d.device_mode === m
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-surface text-muted hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name={`mode-${d.id}`}
                    checked={d.device_mode === m}
                    onChange={() => setMode(d.id, m)}
                    className="accent-[var(--primary)]"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
