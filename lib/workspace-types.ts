export type DeviceMode = "physical" | "virtual" | "simulator" | "hybrid";

export interface CatalogItem {
  component_id: string;
  name: string;
  category: string;
  voltage_v?: number;
  protocols?: string[];
  params?: Record<string, unknown>;
  pins?: number | Array<Record<string, unknown>>;
  interfaces?: string[];
  compatible_controllers?: string[];
  voltage?: { min?: number; max?: number };
  catalog_category?: string;
  simulation?: Record<string, unknown>;
}

export interface WorkspaceNode {
  id: string;
  component_id: string;
  label: string;
  category: string;
  position: { x: number; y: number };
  device_mode: DeviceMode;
  pin_map: Record<string, string>;
  properties: Record<string, unknown>;
  live_state: Record<string, unknown>;
  available: boolean;
  type?: string;
}

export interface WorkspaceWire {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  color?: string;
  protocol?: string;
  voltage_v?: number;
  label?: string;
  valid?: boolean;
  issues?: string[];
  bus?: Record<string, unknown>;
}

export interface WorkspaceInspector {
  fps: number;
  events_per_sec: number;
  sim_time_ms: number;
  tick_count: number;
  queue_length: number;
  node_count: number;
  wire_count: number;
  status: string;
}

export interface WorkspaceState {
  workspace_id: string;
  name: string;
  status: string;
  speed: string;
  sim_time_ms: number;
  tick_count: number;
  events_per_sec: number;
  fps: number;
  canvas: { nodes: WorkspaceNode[]; edges: WorkspaceWire[] };
  console?: Array<Record<string, unknown>>;
  serial?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  gpio_samples?: Array<Record<string, unknown>>;
  adc_samples?: Array<Record<string, unknown>>;
  devices?: WorkspaceNode[];
  inspector?: WorkspaceInspector;
}

export type BottomPanelTab =
  | "console"
  | "serial"
  | "simlog"
  | "events"
  | "logic"
  | "scope"
  | "power"
  | "uart"
  | "mqtt"
  | "websocket";
