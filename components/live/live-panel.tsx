"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEventStream } from "@/lib/ws-client";
import { useMemo } from "react";

const EVENT_COLORS: Record<string, "default" | "success" | "warning" | "info"> = {
  DEVICE_CONNECTED: "success",
  DEVICE_DISCONNECTED: "warning",
  SYNC_STARTED: "info",
  SYNC_PROGRESS: "info",
  SYNC_COMPLETED: "success",
  CORRECTION_APPLIED: "default",
  EXPERIMENT_COMPLETED: "success",
};

function LiveEventFeed({
  events,
  connected,
  onClear,
}: {
  events: DashboardEvent[];
  connected: boolean;
  onClear: () => void;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Real-Time Event Feed</h3>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "success" : "warning"}>
            {connected ? "Live" : "Disconnected"}
          </Badge>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted hover:text-zinc-800"
          >
            Clear
          </button>
        </div>
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
        {events.length === 0 ? (
          <li className="text-muted">Waiting for platform events…</li>
        ) : (
          events.map((event) => (
            <li
              key={event.event_id}
              className="flex items-start justify-between gap-2 rounded-[10px] border border-border px-3 py-2 "
            >
              <div>
                <Badge variant={EVENT_COLORS[event.event_type] ?? "default"}>
                  {event.event_type}
                </Badge>
                <p className="mt-1 text-xs text-muted">
                  {event.experiment_id ?? event.device_id ?? "platform"}
                </p>
              </div>
              <span className="text-xs text-muted">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

function LiveSyncChart({ events }: { events: DashboardEvent[] }) {
  const chartData = useMemo(() => {
    return events
      .filter(
        (e) =>
          e.event_type === "SYNC_PROGRESS" ||
          e.event_type === "SYNC_COMPLETED" ||
          e.event_type === "CORRECTION_APPLIED",
      )
      .slice(0, 20)
      .reverse()
      .map((e, i) => ({
        label: `#${i + 1}`,
        progress: Number(e.payload?.progress ?? 0),
        offset: Number(e.payload?.estimated_offset ?? e.payload?.progress ?? 0),
      }));
  }, [events]);

  if (!chartData.length) {
    return (
      <Card>
        <h3 className="mb-4 font-medium">Live Synchronization</h3>
        <p className="text-sm text-muted">Sync progress will appear here in real time.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 font-medium">Live Synchronization</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="progress" name="Progress %" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="offset" name="Offset" stroke="#059669" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DeviceStatusCards({ events }: { events: DashboardEvent[] }) {
  const devices = useMemo(() => {
    const map = new Map<string, { status: string; lastEvent: string }>();
    for (const event of [...events].reverse()) {
      if (!event.device_id) continue;
      if (map.has(event.device_id)) continue;
      const status =
        event.event_type === "DEVICE_CONNECTED"
          ? "connected"
          : event.event_type === "DEVICE_DISCONNECTED"
            ? "disconnected"
            : "active";
      map.set(event.device_id, { status, lastEvent: event.event_type });
    }
    return Array.from(map.entries()).map(([id, info]) => ({ id, ...info }));
  }, [events]);

  return (
    <Card>
      <h3 className="mb-4 font-medium">Device Status</h3>
      {devices.length === 0 ? (
        <p className="text-sm text-muted">No live device events yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {devices.map((d) => (
            <div
              key={d.id}
              className="rounded-[10px] border border-border px-3 py-2 "
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{d.id}</span>
                <Badge variant={d.status === "connected" ? "success" : "warning"}>
                  {d.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{d.lastEvent}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ExperimentTimeline({ events }: { events: DashboardEvent[] }) {
  const timeline = useMemo(
    () =>
      events.filter((e) =>
        ["SYNC_STARTED", "SYNC_PROGRESS", "SYNC_COMPLETED", "EXPERIMENT_COMPLETED"].includes(
          e.event_type,
        ),
      ),
    [events],
  );

  return (
    <Card>
      <h3 className="mb-4 font-medium">Experiment Timeline</h3>
      {timeline.length === 0 ? (
        <p className="text-sm text-muted">Start an experiment to see the timeline.</p>
      ) : (
        <ol className="relative border-l border-border pl-4 dark:border-zinc-700">
          {timeline.map((event) => (
            <li key={event.event_id} className="mb-4 ml-2">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500" />
              <p className="text-sm font-medium">{event.event_type.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted">
                {event.experiment_id} · {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function LiveOperationsPanel() {
  const { events, connected, clear } = useEventStream();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <LiveSyncChart events={events} />
      <LiveEventFeed events={events} connected={connected} onClear={clear} />
      <DeviceStatusCards events={events} />
      <ExperimentTimeline events={events} />
    </div>
  );
}
