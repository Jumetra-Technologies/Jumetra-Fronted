export interface HybridPhysicalPin {
  pin_id: string;
  name: string;
  number: number | string;
  interfaces: string[];
  signal?: string;
  voltage_v?: number;
  state?: number;
}

export interface HybridPhysicalDevice {
  device_id: string;
  board_type: string;
  port: string;
  endpoint?: string;
  label: string;
  firmware_version?: string;
  capabilities: string[];
  pins: HybridPhysicalPin[];
  connected: boolean;
  connection_state?: string;
  vendor?: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  interfaces?: string[];
  transport?: string;
  communication_method?: string;
  profile_id?: string;
  metadata?: Record<string, unknown>;
}

export interface HybridHardwareProfile {
  profile_id: string;
  vendor: string;
  model: string;
  category: string;
  board_type: string;
  label: string;
  default_transport: string;
  capabilities: Array<string | { name: string }>;
  pins: HybridPhysicalPin[];
}

export interface HybridPinConnection {
  connection_id: string;
  workspace_id?: string;
  virtual_node_id: string;
  virtual_pin_id: string;
  physical_device_id: string;
  physical_pin_id: string;
  valid: boolean;
  issues: string[];
}
