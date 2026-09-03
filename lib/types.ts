export interface ExperimentSummary {
  experiment_id: string;
  name: string;
  strategy: string;
  status: string;
  device_count: number;
  start_time?: number | null;
  end_time?: number | null;
  duration_ms?: number | null;
  average_sync_error: number;
  correction_success_rate: number;
}

export interface DeviceSummary {
  device_id: string;
  status: string;
  reliability_score: number;
  health_score: number;
  average_sync_error: number;
  drift_rate: number;
  experiment_count: number;
}

export interface LatencyDistribution {
  p50: number;
  p95: number;
  min: number;
  max: number;
  mean: number;
}

export interface DashboardOverview {
  active_experiments: number;
  total_experiments: number;
  connected_devices: number;
  synchronization_accuracy: number;
  latency: LatencyDistribution;
  system_health: number;
  recent_experiments: ExperimentSummary[];
}

export interface ExperimentDetail {
  experiment_id: string;
  name: string;
  strategy: string;
  status: string;
  summary: Record<string, unknown>;
  analytics: Record<string, unknown>;
  report: Record<string, unknown>;
  sync_time_series: Array<Record<string, unknown>>;
  sync_measurements: Array<Record<string, unknown>>;
  sync_results: Array<Record<string, unknown>>;
  transactions: Array<Record<string, unknown>>;
}

export interface DeviceDetail {
  device_id: string;
  status: string;
  metrics: Record<string, unknown>;
  reliability: Record<string, unknown>;
  sync_history: Array<Record<string, unknown>>;
  experiments: string[];
}

export interface AnalyticsOverview {
  experiment_count: number;
  device_count: number;
  average_sync_error: number;
  offset_stability: number;
  drift_rate: number;
  correction_success_rate: number;
  rollback_frequency: number;
  communication_cost: number;
  latency_distribution: Record<string, number>;
  device_rankings: Array<Record<string, unknown>>;
}

export interface ComparisonResult {
  fixed_experiment_id: string;
  adaptive_experiment_id: string;
  accuracy_difference: number;
  communication_savings: number;
  correction_efficiency: number;
  failure_difference: number;
  metadata: Record<string, unknown>;
}

export interface ExperimentStatus {
  experiment_id: string;
  name: string;
  status: string;
  strategy: string;
  devices: string[];
  progress: number;
  start_time?: number | null;
  end_time?: number | null;
  elapsed_ms?: number | null;
  event_count: number;
  sync_measurement_count: number;
  metadata: Record<string, unknown>;
}

export interface DashboardEvent {
  event_id: string;
  event_type: string;
  timestamp: number;
  device_id?: string | null;
  experiment_id?: string | null;
  payload: Record<string, unknown>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  organization: string;
  experiment_count: number;
  created_at?: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  experiments: Array<Record<string, unknown>>;
  datasets: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
}

export interface ComponentSpec {
  component_id: string;
  name: string;
  category: string;
  description: string;
  manufacturer: string;
  interfaces: string[];
  voltage_v: number;
  current_ma: number;
  pins: { count: number; interfaces: string[]; notes?: string };
  libraries: string[];
  tags: string[];
}

export interface ComponentSearchHit {
  component: ComponentSpec;
  score: number;
  compatible_controllers: string[];
}

export interface ComponentV2Pin {
  id: string;
  name: string;
  type: string;
  direction?: string;
  voltage?: number;
  position?: { x: number; y: number };
  capabilities?: string[];
}

export interface ComponentV2SearchHit {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  description?: string;
  preview?: string;
  pins: ComponentV2Pin[];
  interfaces: string[];
  keywords?: string[];
  aliases?: string[];
  simulation?: { behavior?: string; supported?: boolean };
  hardware?: { physical_supported?: boolean };
  visual?: { renderer?: string; width?: number; height?: number };
}

export interface ComponentV2Detail extends ComponentV2SearchHit {
  datasheet?: string;
  renderer_svg?: string;
  has_renderer?: boolean;
  has_datasheet?: boolean;
}

export interface ControllerSpec {
  controller_id: string;
  name: string;
  family: string;
  description: string;
  voltage_v: number;
  digital_pins: number;
  analog_pins: number;
  pwm_pins: number;
  supports_i2c: boolean;
  supports_spi: boolean;
  supports_wifi: boolean;
}

export interface CompatibilityResult {
  component_id: string;
  controller_id: string;
  compatible: boolean;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface LaboratorySession {
  laboratory_id: string;
  name: string;
  controller_id: string;
  component_ids: string[];
  session?: {
    circuit: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };
    status: string;
    components: Array<Record<string, unknown>>;
  };
}

export interface SimulationBehaviorState {
  instance_id: string;
  component_id: string;
  pin_map: Record<string, string>;
  state: Record<string, unknown>;
}

export interface SimulationState {
  laboratory_id: string;
  controller_id?: string;
  state: string;
  sim_time_ms?: number;
  tick_count?: number;
  behaviors?: SimulationBehaviorState[];
  controller?: Record<string, unknown>;
  circuit?: {
    react_flow?: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };
  };
}

export interface SimulationStepResult {
  status: string;
  step?: { sim_time_ms: number; tick: number; fired_tasks: string[] };
  state?: SimulationState;
}

export interface HybridAssignment {
  component_id: string;
  mode: string;
  device_id: string;
  instance_id: string;
  pin: string;
  available: boolean;
  simulator_backend: string;
}

export interface HybridExperiment {
  experiment_id: string;
  name: string;
  laboratory_id: string;
  controller_id: string;
  component_ids: string[];
  assignments: HybridAssignment[];
  status: string;
  circuit?: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };
  missing_components?: string[];
  hardware_availability?: Record<string, unknown>;
}
