"use client";

import { FormEvent, useState } from "react";
import { AnimatedCircuitCanvas } from "@/components/laboratory/animated-circuit-canvas";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { ComponentSearchHit, ControllerSpec, HybridExperiment } from "@/lib/types";

const MODE_OPTIONS = ["virtual", "physical", "simulated", "hybrid"] as const;

export function HybridPanel({
  controllers,
  componentHits,
}: {
  controllers: ControllerSpec[];
  componentHits: ComponentSearchHit[];
}) {
  const [name, setName] = useState("Hybrid Greenhouse");
  const [controllerId, setControllerId] = useState(controllers[0]?.controller_id ?? "esp32");
  const [selected, setSelected] = useState<string[]>(["dht22", "led", "relay"]);
  const [modes, setModes] = useState<Record<string, string>>({
    dht22: "virtual",
    led: "physical",
    relay: "simulated",
  });
  const [experiment, setExperiment] = useState<HybridExperiment | null>(null);
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleComponent(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      setModes((m) => ({ ...m, [id]: m[id] ?? "virtual" }));
      return [...prev, id];
    });
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.createHybridExperiment({
        name,
        controller_id: controllerId,
        component_ids: selected,
        device_modes: Object.fromEntries(selected.map((id) => [id, modes[id] ?? "virtual"])),
      });
      setExperiment(result);
      setStatus("created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hybrid experiment");
    } finally {
      setLoading(false);
    }
  }

  async function onStart() {
    if (!experiment) return;
    setLoading(true);
    try {
      const result = await api.startHybridExperiment(experiment.experiment_id);
      setStatus(result.status);
      setState(result.state ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Start failed");
    } finally {
      setLoading(false);
    }
  }

  async function onAdvance() {
    if (!experiment) return;
    setLoading(true);
    try {
      const result = await api.advanceHybridExperiment(experiment.experiment_id);
      setStatus(result.status);
      setState(result.state ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Advance failed");
    } finally {
      setLoading(false);
    }
  }

  const circuit = (experiment?.circuit ?? state?.circuit) as
    | { nodes?: Array<Record<string, unknown>>; edges?: Array<Record<string, unknown>> }
    | undefined;
  const missing = (state?.missing_components as string[]) ?? experiment?.missing_components ?? [];
  const availability = (state?.hardware_availability ?? experiment?.hardware_availability) as
    | Record<string, unknown>
    | undefined;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-medium">Create Hybrid Experiment</h3>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <label className="text-xs text-muted">Experiment name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Controller</label>
              <select
                value={controllerId}
                onChange={(e) => setControllerId(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
              >
                {controllers.map((c) => (
                  <option key={c.controller_id} value={c.controller_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted">Components & device modes</label>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                {componentHits.map((hit) => {
                  const id = hit.component.component_id;
                  const checked = selected.includes(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-[10px] border border-border px-3 py-2 text-sm "
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleComponent(id)} />
                      <span className="flex-1">{hit.component.name}</span>
                      {checked ? (
                        <select
                          value={modes[id] ?? "virtual"}
                          onChange={(e) => setModes((m) => ({ ...m, [id]: e.target.value }))}
                          className="rounded border border-border px-2 py-1 text-xs "
                        >
                          {MODE_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || selected.length === 0}
              className="rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] disabled:opacity-50"
            >
              Create Hybrid Experiment
            </button>
          </form>
          {experiment ? (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-muted">Experiment:</span> {experiment.experiment_id}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onStart} disabled={loading} className="rounded-[10px] border px-3 py-1.5 text-sm">
                  Start
                </button>
                <button type="button" onClick={onAdvance} disabled={loading} className="rounded-[10px] border px-3 py-1.5 text-sm">
                  Advance
                </button>
              </div>
              {status ? <Badge variant={status === "running" ? "success" : "info"}>{status}</Badge> : null}
            </div>
          ) : null}
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </Card>

        <Card>
          <h3 className="mb-4 font-medium">Hardware Availability</h3>
          {availability ? (
            <div className="space-y-3 text-sm">
              {Object.entries(availability).map(([mode, items]) => (
                <div key={mode}>
                  <p className="font-medium capitalize">{mode}</p>
                  <ul className="mt-1 list-inside list-disc text-muted">
                    {Array.isArray(items) && items.length ? (
                      items.map((item, i) => (
                        <li key={i}>{JSON.stringify(item)}</li>
                      ))
                    ) : (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Create an experiment to inspect device availability.</p>
          )}
          {missing.length ? (
            <div className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Missing components</p>
              <p>{missing.join(", ")}</p>
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-medium">Hybrid Circuit</h3>
        <AnimatedCircuitCanvas
          nodes={circuit?.nodes ?? []}
          edges={circuit?.edges ?? []}
          activeNodeIds={
            ((state?.devices as Array<{ instance_id?: string; device_id?: string }>) ?? [])
              .map((d) => String(d.instance_id || d.device_id || ""))
              .filter(Boolean)
          }
        />
      </Card>
    </div>
  );
}
