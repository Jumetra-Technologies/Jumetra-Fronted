import type { DiscoveredHardwareDevice } from "@/stores/discovery-store";
import type {
  HybridPhysicalDevice,
  HybridPhysicalPin,
  HybridPinConnection,
} from "@/lib/hybrid-types";
import type {
  AnalyticsOverview,
  ComparisonResult,
  ComponentSearchHit,
  ComponentV2Detail,
  ComponentV2SearchHit,
  ControllerSpec,
  HybridExperiment,
  DashboardOverview,
  DeviceDetail,
  DeviceSummary,
  ExperimentDetail,
  ExperimentStatus,
  ExperimentSummary,
  LaboratorySession,
  ProjectDetail,
  ProjectSummary,
  SimulationState,
  SimulationStepResult,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  const fetchInit: RequestInit = { ...init, headers };
  // Next.js cache hints are server-only; omit in the browser to avoid fetch failures.
  if (typeof window === "undefined" && !init?.method) {
    (fetchInit as RequestInit & { next?: { revalidate: number } }).next = { revalidate: 10 };
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, fetchInit);
  } catch (err) {
    const hint =
      typeof window !== "undefined"
        ? `Cannot reach HHIP API at ${API_BASE}. Start it with: python hhip/run_api.py`
        : "";
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(hint ? `${message}. ${hint}` : message);
  }
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getDashboardOverview: () => fetchJson<DashboardOverview>("/analytics/dashboard"),
  getExperiments: () => fetchJson<ExperimentSummary[]>("/experiments"),
  getExperiment: (id: string) => fetchJson<ExperimentDetail>(`/experiments/${id}`),
  getExperimentStatus: (id: string) => fetchJson<ExperimentStatus>(`/experiments/${id}/status`),
  startExperiment: (body: {
    name: string;
    devices?: string[];
    strategy?: string;
    duration_ms?: number;
    sync_interval_ms?: number;
  }) =>
    fetchJson<ExperimentStatus>("/experiments/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  pauseExperiment: (id: string) =>
    fetchJson<ExperimentStatus>(`/experiments/${id}/pause`, { method: "POST" }),
  stopExperiment: (id: string) =>
    fetchJson<ExperimentStatus>(`/experiments/${id}/stop`, { method: "POST" }),
  getDevices: () => fetchJson<DeviceSummary[]>("/devices"),
  getDevice: (id: string) => fetchJson<DeviceDetail>(`/devices/${id}`),
  getAnalytics: () => fetchJson<AnalyticsOverview>("/analytics"),
  getComparison: () => fetchJson<ComparisonResult>("/analytics/comparison"),
  getProjects: () => fetchJson<ProjectSummary[]>("/workspace/projects"),
  getProject: (id: string) => fetchJson<ProjectDetail>(`/workspace/projects/${id}`),
  searchComponents: (params: {
    q?: string;
    category?: string;
    interface?: string;
    controller_id?: string;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.interface) qs.set("interface", params.interface);
    if (params.controller_id) qs.set("controller_id", params.controller_id);
    if (params.limit != null) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetchJson<ComponentSearchHit[]>(`/components/search${query ? `?${query}` : ""}`);
  },
  debugComponents: () =>
    fetchJson<{
      total_components: number;
      categories: string[];
      sample_components: Array<Record<string, unknown>>;
      components_dir?: string;
      json_catalog_count?: number;
    }>("/components/debug"),
  searchComponentsV2: (params: { q?: string; category?: string; interface?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    if (params.interface) qs.set("interface", params.interface);
    if (params.limit != null) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetchJson<{ results: ComponentV2SearchHit[]; total: number }>(
      `/components/v2/search${query ? `?${query}` : ""}`,
    );
  },
  getComponentV2: (id: string) => fetchJson<ComponentV2Detail>(`/components/v2/${id}`),
  getComponentV2RendererUrl: (id: string) => `${API_BASE}/components/v2/${id}/renderer.svg`,
  debugComponentsV2: () =>
    fetchJson<{
      total_packages: number;
      categories: string[];
      renderers: string[];
      packages_dir: string;
      sample: string[];
    }>("/components/v2/debug"),
  createComponentV2Binding: (body: {
    component_id: string;
    instance_id?: string;
    mode?: string;
    transport?: string;
    device_id?: string;
    port?: string;
  }) =>
    fetchJson<Record<string, unknown>>("/components/v2/bindings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  switchComponentV2Binding: (
    instanceId: string,
    body: { mode: string; device_id?: string; transport?: string; port?: string },
  ) =>
    fetchJson<Record<string, unknown>>(`/components/v2/bindings/${instanceId}/mode`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  simulateComponentV2: (
    id: string,
    body?: { instance_id?: string; t_s?: number; inputs?: Record<string, unknown> },
  ) =>
    fetchJson<{ signal: Record<string, unknown> }>(`/components/v2/${id}/simulate`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
  getComponent: (id: string) =>
    fetchJson<{ component: ComponentSearchHit["component"]; compatibility: Array<Record<string, unknown>> }>(
      `/components/${id}`,
    ),
  getControllers: () => fetchJson<ControllerSpec[]>("/controllers"),
  createLaboratory: (body: {
    name: string;
    controller_id: string;
    component_ids: string[];
    description?: string;
  }) =>
    fetchJson<LaboratorySession>("/laboratory/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  startLaboratory: (id: string) =>
    fetchJson<{ status: string; laboratory: LaboratorySession; state?: SimulationState }>(
      `/laboratory/${id}/start`,
      { method: "POST" },
    ),
  getLaboratory: (id: string) => fetchJson<LaboratorySession>(`/laboratory/${id}`),
  getSimulation: (id: string) => fetchJson<SimulationState>(`/laboratory/${id}/simulation`),
  pauseSimulation: (id: string) =>
    fetchJson<{ status: string; state: SimulationState }>(`/laboratory/${id}/simulation/pause`, {
      method: "POST",
    }),
  stopSimulation: (id: string) =>
    fetchJson<{ status: string; state: SimulationState }>(`/laboratory/${id}/simulation/stop`, {
      method: "POST",
    }),
  advanceSimulation: (id: string, deltaMs = 100) =>
    fetchJson<SimulationStepResult>(`/laboratory/${id}/simulation/advance`, {
      method: "POST",
      body: JSON.stringify({ delta_ms: deltaMs }),
    }),
  sendActuatorCommand: (
    laboratoryId: string,
    instanceId: string,
    action: string,
    value?: unknown,
  ) =>
    fetchJson<Record<string, unknown>>(`/laboratory/${laboratoryId}/simulation/command`, {
      method: "POST",
      body: JSON.stringify({ instance_id: instanceId, action, value }),
    }),
  createHybridExperiment: (body: {
    name: string;
    controller_id: string;
    component_ids: string[];
    device_modes?: Record<string, string>;
    physical_device_id?: string;
    simulator_backend?: string;
  }) =>
    fetchJson<HybridExperiment>("/hybrid/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listHybridExperiments: () => fetchJson<HybridExperiment[]>("/hybrid/"),
  getHybridExperiment: (id: string) => fetchJson<Record<string, unknown>>(`/hybrid/${id}`),
  startHybridExperiment: (id: string) =>
    fetchJson<{ status: string; state: Record<string, unknown> }>(`/hybrid/${id}/start`, {
      method: "POST",
    }),
  advanceHybridExperiment: (id: string, deltaMs = 100) =>
    fetchJson<{ status: string; state: Record<string, unknown> }>(`/hybrid/${id}/advance`, {
      method: "POST",
      body: JSON.stringify({ delta_ms: deltaMs }),
    }),
  stopHybridExperiment: (id: string) =>
    fetchJson<{ status: string; state: Record<string, unknown> }>(`/hybrid/${id}/stop`, {
      method: "POST",
    }),
  listHybridPhysicalDevices: () =>
    fetchJson<{ devices: HybridPhysicalDevice[]; count: number }>("/hybrid/devices"),
  connectHybridPhysicalDevice: (body: {
    port?: string;
    endpoint?: string;
    board_type?: string;
    device_id?: string;
    label?: string;
    transport?: string;
    username?: string;
  }) =>
    fetchJson<HybridPhysicalDevice>("/hybrid/devices/connect", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listHybridHardwareProfiles: () =>
    fetchJson<{ profiles: Array<Record<string, unknown>>; count: number }>("/hybrid/profiles"),
  getHybridPhysicalPins: (deviceId: string) =>
    fetchJson<{ device_id: string; pins: HybridPhysicalPin[]; count: number }>(
      `/hybrid/devices/${encodeURIComponent(deviceId)}/pins`,
    ),
  listHybridConnections: () =>
    fetchJson<{ connections: HybridPinConnection[]; count: number }>("/hybrid/connections"),
  createHybridConnection: (body: {
    virtual_node_id: string;
    virtual_pin_id: string;
    physical_device_id: string;
    physical_pin_id: string;
    workspace_id?: string;
  }) =>
    fetchJson<HybridPinConnection>("/hybrid/connections", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  // Sprint 26 — Engineering Workspace
  getWorkspaceCatalog: (params?: {
    q?: string;
    category?: string;
    interface?: string;
    interfaces?: string;
    voltage?: string | number;
    voltages?: string;
    controller_id?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.interface) qs.set("interface", params.interface);
    if (params?.interfaces) qs.set("interfaces", params.interfaces);
    if (params?.voltage != null) qs.set("voltage", String(params.voltage));
    if (params?.voltages) qs.set("voltages", params.voltages);
    if (params?.controller_id) qs.set("controller_id", params.controller_id);
    const query = qs.toString();
    return fetchJson<{ categories: string[]; items: Array<Record<string, unknown>> }>(
      `/engineering/workspace/catalog${query ? `?${query}` : ""}`,
    );
  },
  createEngineeringWorkspace: (body: { name: string; project_id?: string }) =>
    fetchJson<{ workspace_id: string; name: string; status: string }>("/engineering/workspace", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getEngineeringWorkspaceState: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/state`),
  connectEngineeringWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/connect`, { method: "POST" }),
  disconnectEngineeringWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/disconnect`, {
      method: "POST",
    }),
  runEngineeringWorkspace: (id: string, speed = "1x") =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/run`, {
      method: "POST",
      body: JSON.stringify({ speed }),
    }),
  pauseEngineeringWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/pause`, { method: "POST" }),
  resetEngineeringWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/reset`, { method: "POST" }),
  stepEngineeringWorkspace: (id: string, deltaMs = 100) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/step`, {
      method: "POST",
      body: JSON.stringify({ delta_ms: deltaMs }),
    }),
  addWorkspaceNode: (
    id: string,
    body: {
      component_id: string;
      position: { x: number; y: number };
      device_mode?: string;
      physical_port?: string;
      physical_device_id?: string;
      available?: boolean;
      label?: string;
    },
  ) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/nodes`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateWorkspaceNode: (id: string, nodeId: string, patch: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/nodes/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteWorkspaceNodes: (id: string, ids: string[]) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/nodes/delete`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  duplicateWorkspaceNodes: (id: string, ids: string[]) =>
    fetchJson<Array<Record<string, unknown>>>(`/engineering/workspace/${id}/nodes/duplicate`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  addWorkspaceWire: (
    id: string,
    body: {
      source: string;
      target: string;
      source_handle?: string;
      target_handle?: string;
      protocol?: string;
      voltage_v?: number;
    },
  ) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/wires`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteWorkspaceWires: (id: string, ids: string[]) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/wires/delete`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  undoWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/undo`, { method: "POST" }),
  redoWorkspace: (id: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/redo`, { method: "POST" }),
  sendWorkspaceSerial: (id: string, line: string) =>
    fetchJson<Record<string, unknown>>(`/engineering/workspace/${id}/serial`, {
      method: "POST",
      body: JSON.stringify({ line }),
    }),
  listDiscoveredDevices: () =>
    fetchJson<{ devices: DiscoveredHardwareDevice[]; count: number }>("/discovery/devices"),
  scanDiscovery: () =>
    fetchJson<{ devices: DiscoveredHardwareDevice[]; count: number }>("/discovery/scan", {
      method: "POST",
    }),
  uploadDiscoveryFirmware: (port: string, firmwarePath = "") =>
    fetchJson<Record<string, unknown>>("/discovery/firmware/upload", {
      method: "POST",
      body: JSON.stringify({ port, firmware_path: firmwarePath }),
    }),
  // Sprint 29 — live hybrid workspace hardware nodes
  listWorkspaceHardware: (workspaceId = "") => {
    const qs = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchJson<{ hardware: Array<Record<string, unknown>>; count: number }>(
      `/workspace/hardware${qs}`,
    );
  },
  getWorkspaceHardware: (deviceId: string) =>
    fetchJson<Record<string, unknown>>(`/workspace/hardware/${encodeURIComponent(deviceId)}`),
  reconnectWorkspaceHardware: (body: { device_id?: string; project_id?: string }) =>
    fetchJson<Record<string, unknown>>("/workspace/hardware/reconnect", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  disconnectWorkspaceHardware: (deviceId: string) =>
    fetchJson<Record<string, unknown>>("/workspace/hardware/disconnect", {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId }),
    }),
  listWorkspaceHardwareEvents: (limit = 100) =>
    fetchJson<{ events: Array<Record<string, unknown>>; count: number }>(
      `/workspace/hardware/events?limit=${limit}`,
    ),
  // Sprint 30 — interactive hybrid wiring
  listWorkspaceConnections: (workspaceId = "") => {
    const qs = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchJson<{ connections: Array<Record<string, unknown>>; count: number }>(
      `/workspace/connections${qs}`,
    );
  },
  getWorkspaceConnection: (id: string) =>
    fetchJson<Record<string, unknown>>(`/workspace/connections/${encodeURIComponent(id)}`),
  createWorkspaceConnection: (body: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>("/workspace/connections", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteWorkspaceConnection: (id: string) =>
    fetchJson<Record<string, unknown>>(`/workspace/connections/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  patchWorkspaceConnection: (id: string, patch: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>(`/workspace/connections/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  previewWorkspaceConnection: (body: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>("/workspace/connections/preview", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  highlightWorkspacePath: (body: {
    start_device: string;
    start_pin: string;
    end_device: string;
    end_pin: string;
  }) =>
    fetchJson<Record<string, unknown>>("/workspace/connections/highlight", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  writeWorkspacePin: (body: {
    device_id: string;
    pin: string;
    value: unknown;
    mode?: string;
    virtual_node_id?: string;
  }) =>
    fetchJson<Record<string, unknown>>("/workspace/connections/pin-write", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setWorkspacePinMode: (body: { device_id: string; pin: string; mode: string }) =>
    fetchJson<Record<string, unknown>>("/workspace/connections/pin-mode", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  inspectWorkspacePin: (deviceId: string, pin: string) =>
    fetchJson<Record<string, unknown>>(
      `/workspace/connections/pin/${encodeURIComponent(deviceId)}/${encodeURIComponent(pin)}`,
    ),
  // Sprint 31 — Embedded Development Studio
  listFirmwareProjects: () =>
    fetchJson<{ projects: Array<Record<string, unknown>>; count: number }>("/firmware/projects"),
  createFirmwareProject: (body: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>("/firmware/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getFirmwareProject: (id: string) =>
    fetchJson<Record<string, unknown>>(`/firmware/projects/${encodeURIComponent(id)}`),
  saveFirmwareFile: (id: string, body: { path: string; content: string }) =>
    fetchJson<Record<string, unknown>>(`/firmware/projects/${encodeURIComponent(id)}/files`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  listFirmwareTemplates: () =>
    fetchJson<{ templates: Array<Record<string, unknown>>; count: number }>("/firmware/templates"),
  listFirmwareToolchains: () =>
    fetchJson<{
      toolchains: Array<Record<string, unknown>>;
      missing: Array<Record<string, unknown>>;
      count: number;
    }>("/firmware/toolchains"),
  buildFirmware: (body: { project_id: string; use_cache?: boolean }) =>
    fetchJson<Record<string, unknown>>("/firmware/build", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  uploadFirmware: (body: { project_id: string; port?: string; build_id?: string }) =>
    fetchJson<Record<string, unknown>>("/firmware/upload", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getFirmwareLogs: (limit = 200) =>
    fetchJson<{ logs: Array<Record<string, unknown>>; count: number }>(`/firmware/logs?limit=${limit}`),
  getFirmwareSerial: (params?: { limit?: number; query?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.query) qs.set("query", params.query);
    const q = qs.toString();
    return fetchJson<Record<string, unknown>>(`/firmware/serial${q ? `?${q}` : ""}`);
  },
  postFirmwareSerial: (body: Record<string, unknown>) =>
    fetchJson<Record<string, unknown>>("/firmware/serial", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function getWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/events`;
}

export function getWorkspaceWsUrl(workspaceId: string): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/workspace/${workspaceId}`;
}

export function getDiscoveryWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/discovery`;
}

export function getHardwareWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/hardware`;
}

export function getWiringWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/wiring`;
}

export function getFirmwareWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws");
  return `${base}/ws/firmware`;
}

export { API_BASE };
