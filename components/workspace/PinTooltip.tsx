"use client";

import { PIN_COLORS, type HardwarePin } from "./hardware-types";

export function PinTooltip({ pin }: { pin: HardwarePin }) {
  const kind = (pin.type || pin.pin_type || "GPIO").toUpperCase();
  const color = PIN_COLORS[kind] || PIN_COLORS.GPIO;
  const state = pin.state;
  const logic = state?.logic || state?.state || "UNKNOWN";

  return (
    <div className="min-w-[160px] rounded-md border border-border bg-surface px-2.5 py-2 text-[11px] shadow-lg">
      <div className="mb-1 flex items-center gap-2 font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {pin.name}
        <span className="ml-auto font-mono text-muted">#{pin.number}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-muted">
        <dt>Type</dt>
        <dd style={{ color }}>{kind}</dd>
        <dt>Logic</dt>
        <dd className="font-mono text-foreground">{logic}</dd>
        <dt>Voltage</dt>
        <dd className="font-mono text-foreground">
          {(state?.voltage ?? pin.voltage ?? 0).toFixed(2)} V
        </dd>
        {(state?.frequency_hz ?? 0) > 0 && (
          <>
            <dt>Freq</dt>
            <dd className="font-mono">{state?.frequency_hz} Hz</dd>
          </>
        )}
        <dt>I/O</dt>
        <dd>
          {pin.supports_input ? "IN" : "—"}/{pin.supports_output ? "OUT" : "—"}
        </dd>
      </dl>
    </div>
  );
}
