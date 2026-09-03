"use client";

import { useSimulationStore } from "@/stores/simulation-store";

export function SimulationInspector() {
  const inspector = useSimulationStore((s) => s.inspector);
  if (!inspector) {
    return (
      <p className="p-4 text-sm text-muted">Connect a workspace to inspect simulation metrics.</p>
    );
  }
  const rows = [
    ["Status", inspector.status],
    ["FPS", inspector.fps],
    ["Events/sec", inspector.events_per_sec],
    ["Sim time (ms)", inspector.sim_time_ms],
    ["Ticks", inspector.tick_count],
    ["Queue length", inspector.queue_length],
    ["Nodes", inspector.node_count],
    ["Wires", inspector.wire_count],
  ];
  return (
    <div className="bg-surface p-4 text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Simulation Inspector
      </p>
      <dl className="grid grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-[12px] border border-border bg-canvas p-3 shadow-[var(--shadow-sm)]">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">{k}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-foreground">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
