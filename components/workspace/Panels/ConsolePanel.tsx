"use client";

import { useEffect, useMemo, useState } from "react";
import { api, getHardwareWsUrl, getWiringWsUrl } from "@/lib/api-client";
import { useSimulationStore } from "@/stores/simulation-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LogLine = { id: string; channel: string; message: string; ts: number };

/** Integrated console: simulation + GPIO / firmware / heartbeat from hardware WS. */
export function ConsolePanel() {
  const simLines = useSimulationStore((s) => s.console);
  const [hwLines, setHwLines] = useState<LogLine[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sockets: WebSocket[] = [];
    const attach = (url: string) => {
      try {
        const ws = new WebSocket(url);
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            const type = String(msg.type || msg.event || "");
            if (!type || type === "pong" || type.endsWith("_snapshot")) return;
            const p = msg.payload || {};
            const channel =
              type.includes("PIN") || type.includes("SIGNAL")
                ? "gpio"
                : type.includes("WIRE")
                  ? "wire"
                  : type.includes("HEARTBEAT")
                    ? "heartbeat"
                    : type.includes("BOARD")
                      ? "board"
                      : "firmware";
            const detail =
              type === "SIGNAL_CHANGED" || type === "PIN_UPDATED"
                ? `${p.device_id || ""} ${p.pin || ""} ${p.value ?? p.state?.logic ?? ""} latency=${p.latency_ms ?? "—"}ms`
                : JSON.stringify(p).slice(0, 180);
            setHwLines((prev) =>
              [
                ...prev,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  channel,
                  message: `${type} ${detail}`,
                  ts: msg.timestamp_ms || Date.now(),
                },
              ].slice(-400),
            );
          } catch {
            /* ignore */
          }
        };
        sockets.push(ws);
      } catch {
        /* ignore */
      }
    };
    attach(getHardwareWsUrl());
    attach(getWiringWsUrl());
    return () => sockets.forEach((ws) => ws.close());
  }, []);

  const merged = useMemo(() => {
    const sim: LogLine[] = simLines.map((l, i) => ({
      id: `sim-${i}`,
      channel: "sim",
      message: String(l.message),
      ts: Number(l.sim_time_ms ?? l.timestamp_ms ?? 0),
    }));
    return [...sim, ...hwLines].sort((a, b) => a.ts - b.ts);
  }, [simLines, hwLines]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((l) => l.message.toLowerCase().includes(q) || l.channel.includes(q));
  }, [merged, query]);

  function clearAll() {
    setHwLines([]);
  }

  function exportLog() {
    const text = filtered.map((l) => `${l.ts}\t${l.channel}\t${l.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hhip-console.log";
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    void api.listWorkspaceHardwareEvents(50).then((res) => {
      const mapped = (res.events || []).map((e, i) => ({
        id: `hist-${i}`,
        channel: String(e.type || e.event || "event"),
        message: JSON.stringify(e.payload || e).slice(0, 180),
        ts: Number(e.timestamp_ms || 0),
      }));
      if (mapped.length) setHwLines((prev) => [...mapped, ...prev].slice(-400));
    }).catch(() => undefined);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#0B1220]">
      <div className="flex items-center gap-2 border-b border-slate-800 px-2 py-1.5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GPIO, sensors, heartbeat…"
          className="h-7 border-slate-700 bg-slate-900 text-[11px] text-slate-200"
        />
        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-300" onClick={clearAll}>
          Clear
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-300" onClick={exportLog}>
          Export
        </Button>
      </div>
      <div className="hhip-scroll flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-200">
        {filtered.length === 0 ? (
          <p className="text-slate-500">Console output will appear here (sim + hardware).</p>
        ) : (
          filtered.map((l) => (
            <div key={l.id}>
              <span className="text-slate-500">[{l.ts}]</span>{" "}
              <span className="text-cyan-500">{l.channel}</span> {l.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
