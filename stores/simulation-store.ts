import { create } from "zustand";
import type { WorkspaceInspector, WorkspaceState } from "@/lib/workspace-types";

interface SimulationStore {
  status: string;
  speed: string;
  simTimeMs: number;
  tickCount: number;
  fps: number;
  eventsPerSec: number;
  inspector: WorkspaceInspector | null;
  console: Array<Record<string, unknown>>;
  serial: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  gpioSamples: Array<Record<string, unknown>>;
  adcSamples: Array<Record<string, unknown>>;
  applyState: (state: WorkspaceState) => void;
  setSpeed: (speed: string) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  status: "created",
  speed: "1x",
  simTimeMs: 0,
  tickCount: 0,
  fps: 0,
  eventsPerSec: 0,
  inspector: null,
  console: [],
  serial: [],
  events: [],
  gpioSamples: [],
  adcSamples: [],
  applyState: (state) =>
    set({
      status: state.status,
      speed: state.speed,
      simTimeMs: state.sim_time_ms,
      tickCount: state.tick_count,
      fps: state.fps,
      eventsPerSec: state.events_per_sec,
      inspector: state.inspector ?? null,
      console: state.console ?? [],
      serial: state.serial ?? [],
      events: state.events ?? [],
      gpioSamples: state.gpio_samples ?? [],
      adcSamples: state.adc_samples ?? [],
    }),
  setSpeed: (speed) => set({ speed }),
}));
