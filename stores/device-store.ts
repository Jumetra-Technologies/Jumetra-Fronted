import { create } from "zustand";
import type { DeviceMode, WorkspaceNode } from "@/lib/workspace-types";

interface DeviceStore {
  devices: WorkspaceNode[];
  setDevices: (devices: WorkspaceNode[]) => void;
  setDeviceMode: (id: string, mode: DeviceMode) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  setDeviceMode: (id, mode) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, device_mode: mode } : d)),
    })),
}));
