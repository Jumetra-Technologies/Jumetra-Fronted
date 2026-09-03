"use client";

import { useState } from "react";
import { BookOpen, Cable, FileText, Settings2, Activity, ScrollText } from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { useSelectionStore } from "@/stores/selection-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useDeviceStore } from "@/stores/device-store";
import type { DeviceMode, WorkspaceState } from "@/lib/workspace-types";
import { cn } from "@/lib/utils";
import { PinInspectorPanel } from "@/components/workspace/Inspector/PinInspectorPanel";

const TABS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "pins", label: "Pins", icon: Cable },
  { id: "simulation", label: "Simulation", icon: Activity },
  { id: "datasheet", label: "Datasheet", icon: BookOpen },
  { id: "properties", label: "Properties", icon: FileText },
  { id: "logs", label: "Logs", icon: ScrollText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PropertyInspector({ workspaceId }: { workspaceId: string }) {
  const [tab, setTab] = useState<TabId>("general");
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const upsertNode = useWorkspaceStore((s) => s.upsertNode);
  const applyState = useSimulationStore((s) => s.applyState);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const setCanvas = useWorkspaceStore((s) => s.setCanvas);
  const consoleLines = useSimulationStore((s) => s.console);
  const wires = useWorkspaceStore((s) => s.wires);
  const selectedPin = useSelectionStore((s) => s.selectedPin);

  const node = nodes.find((n) => n.id === selectedIds[0]);

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface p-6 text-center">
        <div className="rounded-[12px] border border-dashed border-border bg-canvas px-4 py-8 text-sm text-muted">
          Select a component on the canvas to inspect properties.
        </div>
      </div>
    );
  }

  async function patch(next: Record<string, unknown>) {
    const updated = await api.updateWorkspaceNode(workspaceId, node!.id, next);
    upsertNode(updated as never);
    const state = (await api.getEngineeringWorkspaceState(workspaceId)) as unknown as WorkspaceState;
    applyState(state);
    setCanvas(state.canvas.nodes, state.canvas.edges);
    setDevices(state.canvas.nodes);
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{node.label}</h3>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{node.component_id}</p>
          </div>
          <Badge variant={node.available ? "success" : "warning"}>
            {node.available ? "online" : "missing"}
          </Badge>
        </div>
      </div>

      <div
        className="flex gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5"
        role="tablist"
        aria-label="Inspector tabs"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors",
                tab === t.id
                  ? "bg-accent text-primary"
                  : "text-muted hover:bg-muted-bg hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="hhip-scroll flex-1 overflow-y-auto p-4 text-sm">
        {tab === "general" ? (
          <div className="space-y-3">
            <Field label="Name" value={node.label} />
            <Field label="Category" value={node.category} />
            <label className="block text-xs font-medium text-muted">
              Device Mode
              <Select
                value={node.device_mode}
                onChange={(e) => patch({ device_mode: e.target.value as DeviceMode })}
                className="mt-1.5"
                aria-label="Device mode"
              >
                <option value="physical">Physical</option>
                <option value="virtual">Virtual</option>
                <option value="simulator">Simulator</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </label>
          </div>
        ) : null}

        {tab === "pins" ? (
          <PinInspectorPanel
            node={node}
            wires={wires}
            selectedPinId={selectedPin?.nodeId === node.id ? selectedPin.pinId : null}
          />
        ) : null}

        {tab === "simulation" ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Live State</h4>
            <pre className="overflow-x-auto rounded-[10px] border border-border bg-canvas p-3 font-mono text-[11px] text-foreground">
              {JSON.stringify(node.live_state || {}, null, 2)}
            </pre>
          </div>
        ) : null}

        {tab === "datasheet" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted">Documentation · Compatibility · Pin mapping</p>
            <a
              className="inline-flex text-sm font-medium text-primary underline-offset-2 hover:underline"
              href={`https://www.google.com/search?q=${encodeURIComponent(node.label + " datasheet")}`}
              target="_blank"
              rel="noreferrer"
            >
              Open datasheet search
            </a>
          </div>
        ) : null}

        {tab === "properties" ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Simulation Parameters
            </h4>
            {Object.keys(node.properties || {}).length === 0 ? (
              <p className="text-xs text-muted">No tunable parameters</p>
            ) : (
              Object.entries(node.properties).map(([key, value]) => (
                <label key={key} className="block text-xs font-medium text-muted">
                  {key}
                  <Input
                    defaultValue={String(value)}
                    className="mt-1.5"
                    onBlur={(e) => {
                      const num = Number(e.target.value);
                      patch({
                        properties: {
                          ...node.properties,
                          [key]: Number.isFinite(num) ? num : e.target.value,
                        },
                      });
                    }}
                  />
                </label>
              ))
            )}
          </div>
        ) : null}

        {tab === "logs" ? (
          <div className="space-y-1 font-mono text-[11px] text-muted">
            {consoleLines.slice(-12).map((l, i) => (
              <div key={i} className="rounded-md bg-canvas px-2 py-1">
                [{String(l.sim_time_ms ?? l.timestamp_ms)}] {String(l.message)}
              </div>
            ))}
            {consoleLines.length === 0 ? <p>No workspace logs yet.</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1 font-medium text-foreground", mono && "font-mono text-xs whitespace-pre-wrap")}>
        {value}
      </p>
    </div>
  );
}
