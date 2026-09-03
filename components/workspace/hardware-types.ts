"use client";

/** Pin type → workspace color map (matches engine PIN_COLORS). */
export const PIN_COLORS: Record<string, string> = {
  GPIO: "#2563eb",
  ADC: "#16a34a",
  DAC: "#15803d",
  PWM: "#7c3aed",
  UART: "#ea580c",
  SPI: "#06b6d4",
  I2C: "#ca8a04",
  POWER: "#dc2626",
  GROUND: "#374151",
};

export type LivePinState = {
  logic?: string;
  value?: number;
  voltage?: number;
  frequency_hz?: number;
  duty_cycle?: number;
  timestamp_ms?: number;
  state?: string;
};

export type HardwarePin = {
  name: string;
  pin_id?: string;
  number: number | string;
  type?: string;
  pin_type?: string;
  supports_input?: boolean;
  supports_output?: boolean;
  voltage?: number;
  x?: number;
  y?: number;
  side?: string;
  state?: LivePinState;
};

export type WorkspaceHardwareNode = {
  device_id: string;
  node_id?: string;
  board_type: string;
  manufacturer?: string;
  transport?: string;
  firmware_version?: string;
  pins?: HardwarePin[];
  capabilities?: string[];
  status?: string;
  heartbeat_ms?: number;
  position?: { x: number; y: number };
  rotation?: number;
  collapsed?: boolean;
  endpoint?: string;
  port?: string;
  health?: string;
  available?: boolean;
  label?: string;
  metadata?: Record<string, unknown>;
  last_sync_ms?: number;
};
