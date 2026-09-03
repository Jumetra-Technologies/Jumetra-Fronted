"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type Tool = {
  id: string;
  name: string;
  installed: boolean;
  path?: string;
  version?: string;
  setup_url?: string;
  setup_hint?: string;
  status?: string;
};

export function ToolchainManagerPanel() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [missing, setMissing] = useState<Array<Record<string, unknown>>>([]);

  async function refresh() {
    const res = await api.listFirmwareToolchains();
    setTools((res.toolchains as Tool[]) || []);
    setMissing((res.missing as Array<Record<string, unknown>>) || []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="h-full overflow-auto p-2 text-[11px]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Toolchains</span>
        <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]" onClick={() => void refresh()}>
          Rescan
        </Button>
      </div>
      <ul className="space-y-1">
        {tools.map((t) => (
          <li key={t.id} className="rounded border border-border px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t.name}</span>
              <span
                className={`rounded px-1 text-[10px] ${
                  t.installed ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-700"
                }`}
              >
                {t.installed ? "installed" : "missing"}
              </span>
            </div>
            {t.installed ? (
              <p className="truncate font-mono text-[10px] text-muted">
                {t.path} {t.version ? `· ${t.version}` : ""}
              </p>
            ) : (
              <p className="text-[10px] text-muted">{t.setup_hint}</p>
            )}
            {!t.installed && t.setup_url ? (
              <a
                href={t.setup_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary underline"
              >
                Guided setup
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="mt-2 text-[10px] text-muted">{missing.length} toolchain(s) need setup for full native builds.</p>
      )}
    </div>
  );
}
