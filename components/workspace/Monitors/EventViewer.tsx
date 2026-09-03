"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSimulationStore } from "@/stores/simulation-store";

export function EventViewer() {
  const events = useSimulationStore((s) => s.events);
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        String(e.type).toLowerCase().includes(q) ||
        String(e.source).toLowerCase().includes(q) ||
        JSON.stringify(e.payload).toLowerCase().includes(q),
    );
  }, [events, filter]);

  return (
    <div className="flex h-full flex-col bg-surface text-xs">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="font-semibold text-foreground">Event Viewer</span>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter / search…"
          className="ml-auto h-8 w-48"
          aria-label="Filter events"
        />
      </div>
      <div className="hhip-scroll flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-canvas">
            <tr className="text-muted">
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Dest</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted-bg/60">
                <td className="px-3 py-1.5 font-mono text-foreground">
                  {String(e.sim_time_ms ?? e.timestamp_ms)}
                </td>
                <td className="px-3 py-1.5">{String(e.type)}</td>
                <td className="px-3 py-1.5">{String(e.source)}</td>
                <td className="px-3 py-1.5">{String(e.destination)}</td>
                <td className="px-3 py-1.5">{String(e.status)}</td>
                <td className="max-w-xs truncate px-3 py-1.5 font-mono text-muted">
                  {JSON.stringify(e.payload)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
