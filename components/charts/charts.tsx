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

const GRID = "#E5E7EB";
const PRIMARY = "#2563EB";
const SUCCESS = "#10B981";
const MUTED = "#64748B";

export function SyncOffsetChart({
  data,
}: {
  data: Array<{ label: string; offset: number }>;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted">No synchronization data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: MUTED }} />
        <YAxis tick={{ fontSize: 12, fill: MUTED }} unit=" ms" />
        <Tooltip />
        <Line type="monotone" dataKey="offset" stroke={PRIMARY} strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DriftChart({
  data,
}: {
  data: Array<{ device: string; drift: number }>;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted">No drift data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="device" tick={{ fontSize: 12, fill: MUTED }} />
        <YAxis tick={{ fontSize: 12, fill: MUTED }} />
        <Tooltip />
        <Line type="monotone" dataKey="drift" stroke={SUCCESS} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComparisonBarChart({
  data,
}: {
  data: Array<{ metric: string; fixed: number; adaptive: number }>;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted">No comparison data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="metric" tick={{ fontSize: 12, fill: MUTED }} />
        <YAxis tick={{ fontSize: 12, fill: MUTED }} />
        <Tooltip />
        <Line type="monotone" dataKey="fixed" name="Fixed" stroke={MUTED} strokeWidth={2} />
        <Line type="monotone" dataKey="adaptive" name="Adaptive" stroke={PRIMARY} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MetricTiles({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[12px] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-muted">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
