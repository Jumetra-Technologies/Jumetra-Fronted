"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSelectionStore } from "@/stores/selection-store";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyWorkspaceSnapshot } from "@/lib/workspace-snapshot";

export function WireEditor({ workspaceId }: { workspaceId: string }) {
  const wires = useWorkspaceStore((s) => s.wires);
  const setSelection = useSelectionStore((s) => s.setSelection);

  async function remove(id: string) {
    applyWorkspaceSnapshot(await api.deleteWorkspaceWires(workspaceId, [id]));
  }

  return (
    <div className="space-y-3 bg-surface p-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Wire Editor</p>
        <p className="mt-1 text-xs text-muted">Colored by protocol · validated on connect</p>
      </div>
      {wires.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-border bg-canvas p-4 text-xs text-muted">
          Connect pins on the canvas to create wires.
        </p>
      ) : (
        wires.map((w) => (
          <div
            key={w.id}
            className="rounded-[12px] border border-border bg-canvas p-3 shadow-[var(--shadow-sm)]"
            onClick={() => setSelection([w.source, w.target])}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSelection([w.source, w.target]);
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground">{w.label || w.id}</span>
              <Badge variant={w.valid === false ? "danger" : "success"}>
                {w.valid === false ? "invalid" : "ok"}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ background: w.color || "#2563EB" }}
              />
              {w.protocol} · {w.voltage_v}V
            </p>
            {w.issues?.length ? (
              <ul className="mt-2 list-inside list-disc text-[11px] text-amber-700">
                {w.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-danger"
              onClick={(e) => {
                e.stopPropagation();
                void remove(w.id);
              }}
            >
              Delete wire
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
