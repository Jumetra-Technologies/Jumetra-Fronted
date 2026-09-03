"use client";

/** Overlay highlighting an entire signal path (board pin → wire → component). */
export function SignalTraceOverlay({
  path,
  visible,
}: {
  path: string[];
  visible: boolean;
}) {
  if (!visible || !path.length) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-12 z-20 max-w-sm rounded-lg border border-primary/40 bg-surface/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">Signal path</p>
      <ol className="space-y-0.5 font-mono text-[11px] text-foreground">
        {path.map((node, i) => (
          <li key={`${node}-${i}`}>
            {i > 0 ? "→ " : ""}
            {node}
          </li>
        ))}
      </ol>
    </div>
  );
}
