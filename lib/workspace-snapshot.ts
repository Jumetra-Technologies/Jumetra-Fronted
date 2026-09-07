import { useSimulationStore } from "@/stores/simulation-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceNode, WorkspaceState, WorkspaceWire } from "@/lib/workspace-types";

const STORAGE_KEY = "hhip.workspaceId";

export function readPersistedWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("workspace");
    if (fromUrl) return fromUrl;
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    const url = new URL(window.location.href);
    url.searchParams.set("workspace", id);
    window.history.replaceState({}, "", url.toString());
  } catch {
    /* ignore storage / history failures */
  }
}

export function coerceWorkspaceState(raw: unknown): WorkspaceState {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const canvas = (s.canvas && typeof s.canvas === "object" ? s.canvas : {}) as Record<string, unknown>;
  const nodes = Array.isArray(canvas.nodes) ? (canvas.nodes as WorkspaceNode[]) : [];
  const edges = Array.isArray(canvas.edges) ? (canvas.edges as WorkspaceWire[]) : [];
  return {
    workspace_id: String(s.workspace_id ?? ""),
    name: String(s.name ?? ""),
    status: String(s.status ?? "created"),
    speed: String(s.speed ?? "1x"),
    sim_time_ms: Number(s.sim_time_ms ?? 0),
    tick_count: Number(s.tick_count ?? 0),
    events_per_sec: Number(s.events_per_sec ?? 0),
    fps: Number(s.fps ?? 0),
    canvas: { nodes, edges },
    console: Array.isArray(s.console) ? (s.console as WorkspaceState["console"]) : [],
    serial: Array.isArray(s.serial) ? (s.serial as WorkspaceState["serial"]) : [],
    events: Array.isArray(s.events) ? (s.events as WorkspaceState["events"]) : [],
    gpio_samples: Array.isArray(s.gpio_samples)
      ? (s.gpio_samples as WorkspaceState["gpio_samples"])
      : [],
    adc_samples: Array.isArray(s.adc_samples)
      ? (s.adc_samples as WorkspaceState["adc_samples"])
      : [],
    devices: Array.isArray(s.devices) ? (s.devices as WorkspaceNode[]) : nodes,
    inspector: (s.inspector as WorkspaceState["inspector"]) ?? undefined,
  };
}

/** Single place to push a server workspace snapshot into client stores. */
export function applyWorkspaceSnapshot(raw: unknown): WorkspaceState {
  const state = coerceWorkspaceState(raw);
  useSimulationStore.getState().applyState(state);
  useWorkspaceStore.getState().setCanvas(state.canvas.nodes, state.canvas.edges);
  if (state.workspace_id) {
    useWorkspaceStore.getState().setWorkspace(state.workspace_id, state.name || "Workspace");
  }
  return state;
}

export function isNotFoundError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("404") || /not found/i.test(message);
}
