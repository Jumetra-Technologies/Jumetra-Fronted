import { create } from "zustand";

export type DiscoveryDeviceStatus =
  | "connecting"
  | "connected"
  | "busy"
  | "disconnected"
  | "error";

export interface DiscoveredHardwareDevice {
  port: string;
  status: DiscoveryDeviceStatus;
  board_type: string;
  label: string;
  vid?: number | null;
  pid?: number | null;
  manufacturer?: string | null;
  description?: string | null;
  serial_number?: string | null;
  device_id?: string | null;
  firmware_version?: string | null;
  capabilities: string[];
  hhip_firmware: boolean;
  last_seen_ms: number;
  error?: string | null;
  baudrate?: number;
}

interface DiscoveryStore {
  devices: DiscoveredHardwareDevice[];
  connected: boolean;
  setDevices: (devices: DiscoveredHardwareDevice[]) => void;
  setConnected: (v: boolean) => void;
}

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  devices: [],
  connected: false,
  setDevices: (devices) => set({ devices }),
  setConnected: (connected) => set({ connected }),
}));

export function statusBadgeVariant(
  status: DiscoveryDeviceStatus,
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "connected":
      return "success";
    case "connecting":
      return "info";
    case "busy":
      return "warning";
    case "error":
      return "danger";
    default:
      return "default";
  }
}
