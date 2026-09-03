"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
} from "lucide-react";
import { api, getWorkspaceWsUrl } from "@/lib/api-client";
import { WorkspaceCanvas } from "@/components/workspace/Canvas/WorkspaceCanvas";
import { ComponentExplorerPro } from "@/components/workspace/DeviceExplorer/ComponentExplorerPro";
import { ComponentBrowser } from "@/components/library/ComponentBrowser";
import { ComponentInspector } from "@/components/library/ComponentInspector";
import type { ComponentV2SearchHit } from "@/lib/types";
import { HardwareDiscoveryPanel } from "@/components/workspace/Hardware/HardwareDiscoveryPanel";
import { HardwareExplorer } from "@/components/workspace/HardwareExplorer";
import { BoardInspector } from "@/components/workspace/BoardInspector";
import { AutoDiscoveryToast } from "@/components/workspace/AutoDiscoveryToast";
import { PropertyInspector } from "@/components/workspace/Inspector/PropertyInspector";
import { SimulationToolbar } from "@/components/workspace/Toolbar/SimulationToolbar";
import { DeviceManagerPanel } from "@/components/workspace/Simulation/DeviceManagerPanel";
import { SimulationInspector } from "@/components/workspace/Simulation/SimulationInspector";
import { BottomDock } from "@/components/workspace/Panels/BottomDock";
import { WireEditor } from "@/components/workspace/Wire/WireEditor";
import { ConnectionManager } from "@/components/workspace/ConnectionManager";
import { ConnectionInspector } from "@/components/workspace/ConnectionInspector";
import { SignalTraceOverlay } from "@/components/workspace/SignalTraceOverlay";
import type { WorkspaceConnection } from "@/components/workspace/ConnectionManager";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useDeviceStore } from "@/stores/device-store";
import { useUIStore } from "@/stores/ui-store";
import type { WorkspaceState } from "@/lib/workspace-types";
import type { WorkspaceHardwareNode } from "@/components/workspace/hardware-types";
import { cn } from "@/lib/utils";

type RightTab = "properties" | "devices" | "wires" | "inspector" | "hardware" | "livewire" | "datasheet";
type LeftTab = "v2" | "classic";

export function EngineeringWorkspaceShell() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("properties");
  const [leftTab, setLeftTab] = useState<LeftTab>("v2");
  const [inspectV2, setInspectV2] = useState<ComponentV2SearchHit | null>(null);
  const [selectedHardware, setSelectedHardware] = useState<WorkspaceHardwareNode | null>(null);
  const [hardwareInspector, setHardwareInspector] = useState<Record<string, unknown> | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<WorkspaceConnection | null>(null);
  const [tracePath, setTracePath] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const setCanvas = useWorkspaceStore((s) => s.setCanvas);
  const applyState = useSimulationStore((s) => s.applyState);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const leftOpen = useUIStore((s) => s.leftOpen);
  const rightOpen = useUIStore((s) => s.rightOpen);
  const setLeftOpen = useUIStore((s) => s.setLeftOpen);
  const setRightOpen = useUIStore((s) => s.setRightOpen);

  const bootstrapWorkspace = useCallback(async () => {
    const created = await api.createEngineeringWorkspace({ name: "Engineering Lab" });
    setWorkspaceId(created.workspace_id);
    setWorkspace(created.workspace_id, created.name);
    const connected = (await api.connectEngineeringWorkspace(
      created.workspace_id,
    )) as unknown as WorkspaceState;
    applyState(connected);
    setCanvas(connected.canvas?.nodes ?? [], connected.canvas?.edges ?? []);
    setDevices(connected.canvas?.nodes ?? []);
    return created.workspace_id;
  }, [setWorkspace, setCanvas, applyState, setDevices]);

  const recoverWorkspace = useCallback(async () => {
    setError("");
    const id = await bootstrapWorkspace();
    return id;
  }, [bootstrapWorkspace]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await bootstrapWorkspace();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to start workspace");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapWorkspace]);

  useEffect(() => {
    if (!workspaceId) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(getWorkspaceWsUrl(workspaceId));
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "workspace_state" && msg.payload) {
            const state = msg.payload as WorkspaceState;
            applyState(state);
            if (state.canvas) {
              setCanvas(state.canvas.nodes, state.canvas.edges);
              setDevices(state.canvas.nodes);
            }
          }
        } catch {
          /* ignore */
        }
      };
      const interval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 5000);
      return () => {
        clearInterval(interval);
        ws?.close();
      };
    } catch {
      return;
    }
  }, [workspaceId, applyState, setCanvas, setDevices]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted">
        Loading engineering workspace…
      </div>
    );
  }
  if (error || !workspaceId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background text-sm">
        <p className="text-danger">{error || "Workspace unavailable"}</p>
        <p className="text-muted">Ensure the API is running on port 8000.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-baseline gap-2">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted"
          >
            HHIP
          </Link>
          <span className="text-sm font-semibold tracking-tight">Engineering Workspace</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Workspace">
          {[
            ["/", "Home"],
            ["/workspace", "Projects"],
            ["/laboratory/workspace", "Laboratory"],
            ["/firmware", "Firmware"],
            ["/experiments", "Experiments"],
            ["/marketplace", "Marketplace"],
            ["/analytics", "Analytics"],
            ["/settings", "Settings"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors",
                href === "/laboratory/workspace"
                  ? "bg-accent text-primary"
                  : "text-muted hover:bg-muted-bg hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-muted sm:inline">{workspaceId}</span>
          <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLeftOpen(!leftOpen)}
            aria-label="Toggle explorer"
          >
            {leftOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRightOpen(!rightOpen)}
            aria-label="Toggle inspector"
          >
            {rightOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <SimulationToolbar workspaceId={workspaceId} />

      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            className="flex w-[272px] shrink-0 flex-col overflow-hidden border-r border-border"
          >
            <div className="min-h-0 flex-[1.1] overflow-hidden border-b border-border">
              <HardwareExplorer
                selectedId={selectedHardware?.device_id}
                onSelect={async (node) => {
                  setSelectedHardware(node);
                  setRightTab("hardware");
                  try {
                    const detail = await api.getWorkspaceHardware(node.device_id);
                    setHardwareInspector((detail.inspector as Record<string, unknown>) || null);
                    setSelectedHardware(detail as WorkspaceHardwareNode);
                  } catch {
                    setHardwareInspector(null);
                  }
                }}
              />
            </div>
            <div className="flex shrink-0 gap-1 border-b border-border bg-surface px-2 py-1">
              <button
                type="button"
                className={cn(
                  "rounded px-2 py-1 text-[10px] font-semibold",
                  leftTab === "v2" ? "bg-sky-600 text-white" : "text-muted hover:bg-muted/40",
                )}
                onClick={() => setLeftTab("v2")}
              >
                Library v2
              </button>
              <button
                type="button"
                className={cn(
                  "rounded px-2 py-1 text-[10px] font-semibold",
                  leftTab === "classic" ? "bg-sky-600 text-white" : "text-muted hover:bg-muted/40",
                )}
                onClick={() => setLeftTab("classic")}
              >
                Classic
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {leftTab === "v2" ? (
                <ComponentBrowser
                  onInspect={(item) => {
                    setInspectV2(item);
                    setRightTab("datasheet");
                  }}
                  onAddToWorkspace={async (item) => {
                    try {
                      const node = await api.addWorkspaceNode(workspaceId, {
                        component_id: item.id,
                        position: { x: 140 + Math.random() * 240, y: 100 + Math.random() * 180 },
                        device_mode: "virtual",
                      });
                      useWorkspaceStore.getState().upsertNode(node as never);
                      await api.createComponentV2Binding({
                        component_id: item.id,
                        instance_id: String((node as { id?: string }).id || item.id),
                        mode: "virtual",
                      });
                      const state = (await api.getEngineeringWorkspaceState(
                        workspaceId,
                      )) as unknown as WorkspaceState;
                      applyState(state);
                      setCanvas(state.canvas?.nodes ?? [], state.canvas?.edges ?? []);
                      setDevices(state.canvas?.nodes ?? []);
                    } catch {
                      /* ignore add errors */
                    }
                  }}
                />
              ) : (
                <ComponentExplorerPro workspaceId={workspaceId} onWorkspaceRecover={recoverWorkspace} />
              )}
            </div>
            <HardwareDiscoveryPanel workspaceId={workspaceId} onWorkspaceRecover={recoverWorkspace} />
          </motion.aside>
        ) : null}

        <main className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-[10px] border border-border bg-surface/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted shadow-[var(--shadow-sm)] backdrop-blur">
            Infinite Canvas · React Flow
          </div>
          <SignalTraceOverlay path={tracePath} visible={tracePath.length > 0} />
          <WorkspaceCanvas workspaceId={workspaceId} />
        </main>

        {rightOpen ? (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-border bg-surface"
          >
            <div className="flex gap-1 border-b border-border p-1.5 text-[11px]">
              {(
                [
                  ["properties", "Inspector"],
                  ["datasheet", "Datasheet"],
                  ["hardware", "Board"],
                  ["livewire", "Wiring"],
                  ["devices", "Devices"],
                  ["wires", "Wires"],
                  ["inspector", "Metrics"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRightTab(id)}
                  className={cn(
                    "rounded-[10px] px-2.5 py-1.5 font-medium transition-colors",
                    rightTab === id
                      ? "bg-accent text-primary"
                      : "text-muted hover:bg-muted-bg hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {rightTab === "properties" ? <PropertyInspector workspaceId={workspaceId} /> : null}
              {rightTab === "datasheet" ? (
                <ComponentInspector componentId={inspectV2?.id} fallback={inspectV2} />
              ) : null}
              {rightTab === "hardware" ? (
                <BoardInspector node={selectedHardware} inspector={hardwareInspector} />
              ) : null}
              {rightTab === "livewire" ? (
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <ConnectionManager
                      workspaceId={workspaceId}
                      selectedId={selectedConnection?.connection_id}
                      onSelect={(c) => setSelectedConnection(c)}
                    />
                  </div>
                  <div className="max-h-[40%] border-t border-border">
                    <ConnectionInspector
                      connection={selectedConnection}
                      onHighlight={async (c) => {
                        try {
                          const res = await api.highlightWorkspacePath({
                            start_device: c.source_device,
                            start_pin: c.source_pin,
                            end_device: c.destination_device,
                            end_pin: c.destination_pin,
                          });
                          setTracePath((res.path as string[]) || []);
                        } catch {
                          setTracePath([
                            `${c.source_device}:${c.source_pin}`,
                            `${c.destination_device}:${c.destination_pin}`,
                          ]);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : null}
              {rightTab === "devices" ? <DeviceManagerPanel workspaceId={workspaceId} /> : null}
              {rightTab === "wires" ? <WireEditor workspaceId={workspaceId} /> : null}
              {rightTab === "inspector" ? <SimulationInspector /> : null}
            </div>
          </motion.aside>
        ) : null}
      </div>

      <BottomDock workspaceId={workspaceId} />
      <AutoDiscoveryToast />
    </div>
  );
}
