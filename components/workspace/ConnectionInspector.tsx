"use client";

import type { WorkspaceConnection } from "./ConnectionManager";

export function ConnectionInspector({
  connection,
  onHighlight,
}: {
  connection: WorkspaceConnection | null;
  onHighlight?: (c: WorkspaceConnection) => void;
}) {
  if (!connection) {
    return (
      <div className="p-3 text-xs text-muted">Select a wire to inspect latency, transport, and endpoints.</div>
    );
  }

  return (
    <div className="overflow-auto p-3 text-[11px]">
      <h3 className="mb-2 text-xs font-semibold">Connection {connection.connection_id}</h3>
      <dl className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1">
        <dt className="text-muted">Source</dt>
        <dd className="font-mono">
          {connection.source_device}:{connection.source_pin}
        </dd>
        <dt className="text-muted">Destination</dt>
        <dd className="font-mono">
          {connection.destination_device}:{connection.destination_pin}
        </dd>
        <dt className="text-muted">Wire type</dt>
        <dd style={{ color: connection.wire_color }}>{connection.wire_type}</dd>
        <dt className="text-muted">Status</dt>
        <dd>{connection.status}</dd>
        <dt className="text-muted">Latency</dt>
        <dd className="font-mono">{connection.latency_ms != null ? `${connection.latency_ms} ms` : "—"}</dd>
        <dt className="text-muted">Valid</dt>
        <dd>{connection.valid === false ? "no" : "yes"}</dd>
      </dl>
      {onHighlight ? (
        <button
          type="button"
          className="mt-3 rounded border border-border px-2 py-1 text-[10px] hover:bg-muted-bg"
          onClick={() => onHighlight(connection)}
        >
          Highlight signal path
        </button>
      ) : null}
    </div>
  );
}
