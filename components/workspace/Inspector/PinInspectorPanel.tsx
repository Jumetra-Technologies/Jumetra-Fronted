"use client";

import { Badge } from "@/components/ui/badge";
import {
  getConnectedWiresForPin,
  getHardwareAssetOrFallback,
  resolvePinSignalState,
} from "@/lib/hardware/registry";
import { signalColor } from "@/lib/hardware/signal-colors";
import type { WorkspaceNode, WorkspaceWire } from "@/lib/workspace-types";
import { cn } from "@/lib/utils";

export function PinInspectorPanel({
  node,
  wires,
  selectedPinId,
}: {
  node: WorkspaceNode;
  wires: WorkspaceWire[];
  selectedPinId?: string | null;
}) {
  const asset = getHardwareAssetOrFallback(node.component_id);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        {asset.pins.length} pins · Click a pin on the board or select below
      </p>
      {asset.pins.map((p) => {
        const connected = getConnectedWiresForPin(node.id, p.id, wires);
        const signal = resolvePinSignalState(node.live_state || {}, p.id);
        const active = selectedPinId === p.id;
        return (
          <div
            key={p.id}
            className={cn(
              "rounded-[10px] border p-3 text-xs shadow-[var(--shadow-sm)] transition-colors",
              active ? "border-primary bg-accent" : "border-border bg-canvas",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">{p.name}</span>
              <Badge variant={connected.length ? "success" : "default"}>
                {connected.length ? "wired" : "open"}
              </Badge>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div>
                <dt className="text-muted">Pin #</dt>
                <dd className="font-mono">{String(p.number)}</dd>
              </div>
              <div>
                <dt className="text-muted">Voltage</dt>
                <dd className="font-mono">{p.voltage}V</dd>
              </div>
              <div>
                <dt className="text-muted">Signal</dt>
                <dd className="font-mono">{signal !== undefined ? String(signal) : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Type</dt>
                <dd className="capitalize">{p.signal ?? "bidirectional"}</dd>
              </div>
            </dl>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.interfaces.map((iface) => (
                <span
                  key={iface}
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
                  style={{ background: `${signalColor(iface)}22`, color: signalColor(iface) }}
                >
                  {iface}
                </span>
              ))}
            </div>
            {connected.length > 0 ? (
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                <p className="font-medium text-muted">Connected wires</p>
                {connected.map((w) => (
                  <p key={w.id} className="font-mono text-[10px] text-foreground">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ background: w.color ?? signalColor(w.protocol) }}
                    />
                    {w.label || w.id} · {w.protocol}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
