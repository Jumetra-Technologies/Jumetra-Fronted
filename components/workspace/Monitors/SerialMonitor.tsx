"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimulationStore } from "@/stores/simulation-store";

export function SerialMonitor({ workspaceId }: { workspaceId: string }) {
  const serial = useSimulationStore((s) => s.serial);
  const [line, setLine] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serial, autoScroll]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!line.trim()) return;
    await api.sendWorkspaceSerial(workspaceId, line);
    setLine("");
    const state = await api.getEngineeringWorkspaceState(workspaceId);
    useSimulationStore.getState().applyState(state as never);
  }

  function exportLog() {
    const text = serial.map((s) => `${s.timestamp_ms} ${s.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serial-monitor.log";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs">
        <span className="font-semibold text-foreground">Serial Monitor</span>
        <label className="ml-auto flex items-center gap-1.5 text-muted">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          Auto Scroll
        </label>
        <Button type="button" size="sm" variant="secondary" onClick={exportLog}>
          Export
        </Button>
      </div>
      <div className="hhip-scroll flex-1 overflow-y-auto bg-[#0B1220] p-3 font-mono text-xs text-emerald-400">
        {serial.map((s, i) => (
          <div key={i}>
            [{String(s.sim_time_ms ?? s.timestamp_ms)}] {String(s.message)}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-2">
        <Input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Transmit…"
          className="flex-1"
          aria-label="Serial transmit"
        />
        <Button type="submit" size="sm">
          Send
        </Button>
      </form>
    </div>
  );
}
