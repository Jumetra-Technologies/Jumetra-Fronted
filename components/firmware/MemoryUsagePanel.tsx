"use client";

export function MemoryUsagePanel({
  memory,
  binarySize,
}: {
  memory?: {
    flash_used?: number;
    flash_total?: number;
    ram_used?: number;
    ram_total?: number;
    flash_percent?: number;
    ram_percent?: number;
  } | null;
  binarySize?: number;
}) {
  if (!memory) {
    return <div className="p-2 text-[11px] text-muted">Memory usage appears after a successful build.</div>;
  }
  const flashPct = memory.flash_percent ?? 0;
  const ramPct = memory.ram_percent ?? 0;
  return (
    <div className="space-y-2 p-2 text-[11px]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Memory</p>
      <div>
        <div className="mb-0.5 flex justify-between font-mono">
          <span>Flash</span>
          <span>
            {memory.flash_used}/{memory.flash_total} ({flashPct}%)
          </span>
        </div>
        <div className="h-1.5 rounded bg-muted-bg">
          <div className="h-full rounded bg-sky-500" style={{ width: `${Math.min(flashPct, 100)}%` }} />
        </div>
      </div>
      <div>
        <div className="mb-0.5 flex justify-between font-mono">
          <span>RAM</span>
          <span>
            {memory.ram_used}/{memory.ram_total} ({ramPct}%)
          </span>
        </div>
        <div className="h-1.5 rounded bg-muted-bg">
          <div className="h-full rounded bg-violet-500" style={{ width: `${Math.min(ramPct, 100)}%` }} />
        </div>
      </div>
      {binarySize != null && (
        <p className="font-mono text-muted">Binary size: {binarySize} bytes</p>
      )}
    </div>
  );
}
