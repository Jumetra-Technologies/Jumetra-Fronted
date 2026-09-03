"use client";

import { useEffect, useState } from "react";
import { BoardHealthBadge } from "./BoardHealthBadge";
import { HardwarePins } from "./HardwarePins";
import { ConnectionManager } from "./ConnectionManager";
import { PinInspector } from "./PinInspector";
import { api } from "@/lib/api-client";
import type { WorkspaceHardwareNode } from "./hardware-types";

type Tab = "overview" | "connections" | "gpio" | "power";

export function BoardInspector({
  node,
  inspector,
}: {
  node: WorkspaceHardwareNode | null;
  inspector?: Record<string, unknown> | null;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [connCount, setConnCount] = useState(0);

  useEffect(() => {
    if (!node) return;
    void api.listWorkspaceConnections().then((r) => {
      const mine = (r.connections || []).filter(
        (c) => c.source_device === node.device_id || c.destination_device === node.device_id,
      );
      setConnCount(mine.length);
    }).catch(() => undefined);
  }, [node?.device_id]);

  if (!node) {
    return (
      <div className="p-3 text-xs text-muted">
        Select a hardware node to inspect manufacturer, firmware, transport, and live health.
      </div>
    );
  }

  const pins = node.pins || [];
  const gpioPins = pins.filter((p) => {
    const t = (p.type || p.pin_type || "").toUpperCase();
    return t === "GPIO" || t === "PWM" || t === "ADC" || t === "DAC";
  });
  const util = pins.length ? Math.round((connCount / Math.max(pins.length, 1)) * 100) : 0;

  const rows: Array<[string, string]> = [
    ["Manufacturer", String(inspector?.manufacturer ?? node.manufacturer ?? "—")],
    ["Chip", String(inspector?.chip ?? node.board_type)],
    ["Firmware", String(inspector?.firmware ?? node.firmware_version ?? "—")],
    ["Transport", String(inspector?.transport ?? node.transport ?? "—")],
    ["COM Port", String(inspector?.com_port ?? node.endpoint ?? node.port ?? "—")],
    ["IP Address", String(inspector?.ip_address ?? "—")],
    ["Memory", String(inspector?.memory ?? "—")],
    ["Voltage", `${inspector?.voltage ?? 3.3} V`],
    ["Temperature", inspector?.temperature != null ? `${inspector.temperature} °C` : "—"],
    ["Heartbeat", String(inspector?.heartbeat ?? node.heartbeat_ms ?? "—")],
    ["Serial Number", String(inspector?.serial_number ?? "—")],
    ["Last Sync", String(inspector?.last_sync ?? node.last_sync_ms ?? "—")],
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold">{node.label || node.board_type}</h3>
        <BoardHealthBadge health={node.health} status={node.status} />
      </div>
      <div className="flex gap-1 border-b border-border p-1 text-[10px]">
        {(
          [
            ["overview", "Overview"],
            ["connections", "Connections"],
            ["gpio", "Live GPIO"],
            ["power", "Power"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded px-2 py-1 font-medium ${
              tab === id ? "bg-accent text-primary" : "text-muted hover:bg-muted-bg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "overview" && (
          <>
            {node.status === "waiting" && (
              <div className="mx-3 mt-2 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-800">
                Waiting for hardware — reconnect when the board is plugged in.
              </div>
            )}
            <dl className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 px-3 py-2 text-[11px]">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate font-mono text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-border px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {(node.capabilities || []).map((c) => (
                  <span key={c} className="rounded bg-muted-bg px-1.5 py-0.5 text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-border px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Pins</p>
              <HardwarePins
                pins={pins}
                onPinClick={(p) => {
                  setSelectedPin(p.name);
                  setTab("gpio");
                }}
              />
            </div>
          </>
        )}

        {tab === "connections" && (
          <div className="flex h-full flex-col">
            <p className="px-3 py-2 text-[11px] text-muted">
              Connected devices · {connCount} wires · pin utilization {util}%
            </p>
            <ConnectionManager />
          </div>
        )}

        {tab === "gpio" && (
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-3 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase text-muted">Live GPIO</p>
              <div className="flex flex-wrap gap-1">
                {gpioPins.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                      selectedPin === p.name ? "border-primary bg-accent" : "border-border"
                    }`}
                    onClick={() => setSelectedPin(p.name)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            {selectedPin ? (
              <PinInspector deviceId={node.device_id} pin={selectedPin} />
            ) : (
              <p className="p-3 text-[11px] text-muted">Select a GPIO pin for live control.</p>
            )}
          </div>
        )}

        {tab === "power" && (
          <div className="space-y-2 p-3 text-[11px]">
            <p>
              <span className="text-muted">Rail voltage</span>{" "}
              <span className="font-mono">{Number(inspector?.voltage ?? 3.3)} V</span>
            </p>
            <p>
              <span className="text-muted">Pin utilization</span>{" "}
              <span className="font-mono">
                {connCount}/{pins.length} ({util}%)
              </span>
            </p>
            <p>
              <span className="text-muted">Communication</span>{" "}
              <span className="font-mono">{node.transport || "—"}</span>
            </p>
            <p className="text-muted">
              Power / ground wires are validated against short-circuit and level-shifter rules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
