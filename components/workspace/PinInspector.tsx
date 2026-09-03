"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { PinModeEditor } from "./PinModeEditor";

export type PinInspectorData = {
  device_id: string;
  pin: string;
  pin_number?: string | number;
  mode?: string;
  current_value?: number | string | null;
  logic?: string;
  voltage?: number;
  direction?: string;
  pwm?: unknown;
  frequency?: number;
  adc?: unknown;
  connected_wires?: Array<Record<string, unknown>>;
  connected_components?: string[];
  live_events?: Array<Record<string, unknown>>;
  state?: Record<string, unknown>;
};

export function PinInspector({
  deviceId,
  pin,
  onClose,
}: {
  deviceId: string;
  pin: string;
  onClose?: () => void;
}) {
  const [data, setData] = useState<PinInspectorData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const res = (await api.inspectWorkspacePin(deviceId, pin)) as PinInspectorData;
      setData(res);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pin");
    }
  }

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 1500);
    return () => clearInterval(t);
  }, [deviceId, pin]);

  async function write(value: number | string, mode = "OUTPUT") {
    setBusy(true);
    try {
      await api.writeWorkspacePin({ device_id: deviceId, pin, value, mode });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Write failed");
    } finally {
      setBusy(false);
    }
  }

  async function setMode(mode: string) {
    setBusy(true);
    try {
      await api.setWorkspacePinMode({ device_id: deviceId, pin, mode });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mode change failed");
    } finally {
      setBusy(false);
    }
  }

  if (!data && !error) {
    return <div className="p-3 text-xs text-muted">Loading pin…</div>;
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold">
          Pin {pin} · {deviceId}
        </h3>
        {onClose ? (
          <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>
      {error && <p className="px-3 py-1 text-[10px] text-danger">{error}</p>}
      <dl className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 px-3 py-2 text-[11px]">
        <dt className="text-muted">Pin Number</dt>
        <dd className="font-mono">{data?.pin_number ?? pin}</dd>
        <dt className="text-muted">Pin Mode</dt>
        <dd className="font-mono">{data?.mode ?? "—"}</dd>
        <dt className="text-muted">Current Value</dt>
        <dd className="font-mono">{String(data?.current_value ?? data?.logic ?? "—")}</dd>
        <dt className="text-muted">Voltage</dt>
        <dd className="font-mono">{data?.voltage != null ? `${data.voltage} V` : "—"}</dd>
        <dt className="text-muted">Direction</dt>
        <dd className="font-mono">{data?.direction ?? "—"}</dd>
        <dt className="text-muted">PWM / Freq</dt>
        <dd className="font-mono">
          {data?.frequency != null ? `${data.frequency} Hz` : String(data?.pwm ?? "—")}
        </dd>
        <dt className="text-muted">ADC</dt>
        <dd className="font-mono">{String(data?.adc ?? "—")}</dd>
      </dl>

      <div className="border-t border-border px-3 py-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Live control</p>
        <div className="mb-2 flex flex-wrap gap-1">
          <Button size="sm" className="h-7 text-[10px]" disabled={busy} onClick={() => void write(1)}>
            HIGH
          </Button>
          <Button size="sm" variant="secondary" className="h-7 text-[10px]" disabled={busy} onClick={() => void write(0)}>
            LOW
          </Button>
        </div>
        <PinModeEditor mode={data?.mode} onChange={(m) => void setMode(m)} disabled={busy} />
      </div>

      <div className="border-t border-border px-3 py-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Connected wires</p>
        {(data?.connected_wires || []).length === 0 ? (
          <p className="text-[11px] text-muted">No wires</p>
        ) : (
          <ul className="space-y-1 text-[11px]">
            {(data?.connected_wires || []).map((w) => (
              <li key={String(w.connection_id)} className="font-mono">
                {String(w.source_device)}:{String(w.source_pin)} → {String(w.destination_device)}:
                {String(w.destination_pin)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-3 py-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Connected components</p>
        <p className="font-mono text-[11px]">
          {(data?.connected_components || []).join(", ") || "—"}
        </p>
      </div>
    </div>
  );
}
