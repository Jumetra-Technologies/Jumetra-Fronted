"use client";

export function BuildOutput({
  logs,
  warnings,
  errors,
  buildTimeMs,
}: {
  logs: string[];
  warnings?: string[];
  errors?: string[];
  buildTimeMs?: number;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0B1220] font-mono text-[11px] text-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-800 px-2 py-1 text-[10px] text-slate-400">
        <span>Build Output</span>
        {buildTimeMs != null && <span className="ml-auto">{buildTimeMs} ms</span>}
      </div>
      <div className="hhip-scroll flex-1 overflow-auto p-2">
        {logs.length === 0 && <p className="text-slate-500">Compile to see logs, warnings, and errors.</p>}
        {logs.map((l, i) => (
          <div
            key={i}
            className={
              /error/i.test(l) ? "text-red-400" : /warning/i.test(l) ? "text-amber-300" : ""
            }
          >
            {l}
          </div>
        ))}
        {(warnings || []).map((w, i) => (
          <div key={`w-${i}`} className="text-amber-300">
            WARN {w}
          </div>
        ))}
        {(errors || []).map((e, i) => (
          <div key={`e-${i}`} className="text-red-400">
            ERR {e}
          </div>
        ))}
      </div>
    </div>
  );
}
