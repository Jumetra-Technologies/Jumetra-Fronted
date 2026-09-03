"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useDeviceStore } from "@/stores/device-store";
import type { CatalogItem, WorkspaceState } from "@/lib/workspace-types";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { id: "mcu", label: "MCU", explorer: ["arduino", "esp32", "stm32", "pico"] },
  { id: "sensors", label: "Sensor", explorer: ["sensors"] },
  { id: "actuators", label: "Actuator", explorer: ["actuators"] },
  { id: "displays", label: "Display", explorer: ["displays"] },
  { id: "communication", label: "Communication", explorer: ["communication"] },
  { id: "power", label: "Power", explorer: [] },
] as const;

const INTERFACE_FILTERS = ["GPIO", "PWM", "UART", "I2C", "SPI"] as const;
const VOLTAGE_FILTERS = [
  { id: 3.3, label: "3.3V" },
  { id: 5, label: "5V" },
] as const;

const CONTROLLERS = [
  { id: "", label: "Any controller" },
  { id: "esp32", label: "ESP32" },
  { id: "arduino-uno", label: "Arduino" },
  { id: "stm32", label: "STM32" },
  { id: "raspberry-pi-pico", label: "Pico" },
] as const;

type ProItem = CatalogItem & {
  interfaces?: string[];
  compatible_controllers?: string[];
  description?: string;
  manufacturer?: string;
  voltage?: { min?: number; max?: number };
  catalog_category?: string;
};

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function categoryLabel(item: ProItem): string {
  const cat = item.catalog_category || item.category || "";
  if (cat === "mcu" || ["arduino", "esp32", "stm32", "pico"].includes(cat)) return "Microcontroller";
  if (cat === "sensor" || cat === "sensors") return "Sensor";
  if (cat === "actuator" || cat === "actuators") return "Actuator";
  if (cat === "display" || cat === "displays") return "Display";
  if (cat === "communication") return "Communication";
  return cat || "Component";
}

export function ComponentExplorerPro({
  workspaceId,
  onWorkspaceRecover,
}: {
  workspaceId: string;
  onWorkspaceRecover?: () => Promise<string | null>;
}) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [voltages, setVoltages] = useState<number[]>([]);
  const [controllerId, setControllerId] = useState("");
  const [items, setItems] = useState<ProItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [totalKnown, setTotalKnown] = useState(0);

  const upsertNode = useWorkspaceStore((s) => s.upsertNode);
  const applyState = useSimulationStore((s) => s.applyState);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const setCanvas = useWorkspaceStore((s) => s.setCanvas);

  useEffect(() => {
    let cancelled = false;
    const firstCat = categories[0];
    const categoryParam =
      firstCat === "mcu"
        ? "mcu"
        : firstCat === "sensors"
          ? "sensor"
          : firstCat === "actuators"
            ? "actuator"
            : firstCat === "displays"
              ? "display"
              : firstCat || undefined;

    api
      .searchComponents({
        q: query || undefined,
        category: categories.length <= 1 ? categoryParam : undefined,
        interface: interfaces[0],
        controller_id: controllerId || undefined,
        limit: 100,
      })
      .then((hits) => {
        if (cancelled) return;
        const mapped: ProItem[] = hits.map((hit) => {
          const flat = hit as unknown as Record<string, unknown>;
          const comp = (hit.component || flat) as unknown as Record<string, unknown>;
          return {
            component_id: String(flat.component_id || comp.component_id || ""),
            name: String(flat.name || comp.name || ""),
            category: String(flat.category || comp.category || ""),
            catalog_category: String(flat.catalog_category || comp.category || ""),
            voltage_v: Number(flat.voltage_v ?? comp.voltage_v ?? 3.3),
            voltage: (flat.voltage as ProItem["voltage"]) || undefined,
            interfaces: (flat.interfaces as string[]) || (comp.interfaces as string[]) || [],
            protocols: (flat.interfaces as string[]) || (comp.interfaces as string[]) || [],
            compatible_controllers:
              (flat.compatible_controllers as string[]) ||
              (hit.compatible_controllers as string[]) ||
              [],
            pins: (flat.pins as ProItem["pins"]) || [],
            description: String(comp.description || ""),
            manufacturer: String(comp.manufacturer || ""),
          };
        });
        setItems(mapped);
        setCatalogLoaded(true);
        setTotalKnown((n) => Math.max(n, mapped.length));
        setCatalogError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setCatalogLoaded(true);
        setCatalogError(err instanceof Error ? err.message : "Catalog unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [query, categories, interfaces, controllerId]);

  // Optional: confirm registry has components on mount
  useEffect(() => {
    api
      .debugComponents()
      .then((dbg) => setTotalKnown(dbg.total_components || 0))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (categories.includes("mcu") && categories.length === 1) {
        const isMcu =
          item.catalog_category === "mcu" ||
          item.category === "mcu" ||
          ["arduino", "esp32", "stm32", "pico"].includes(item.category || "");
        if (!isMcu) return false;
      }
      if (categories.length > 1) {
        const map: Record<string, string[]> = {
          mcu: ["mcu", "arduino", "esp32", "stm32", "pico"],
          sensors: ["sensors", "sensor"],
          actuators: ["actuators", "actuator"],
          displays: ["displays", "display"],
          communication: ["communication"],
          power: ["power"],
        };
        const allowed = new Set(categories.flatMap((c) => map[c] || [c]));
        const cat = item.category || "";
        const ccat = item.catalog_category || "";
        if (!allowed.has(cat) && !allowed.has(ccat)) return false;
      }
      if (voltages.length) {
        const vmax = item.voltage?.max ?? item.voltage_v ?? 3.3;
        const vmin = item.voltage?.min ?? item.voltage_v ?? 3.3;
        const ok = voltages.some((v) => vmin - 0.05 <= v && v <= vmax + 0.05);
        if (!ok) return false;
      }
      if (interfaces.length > 1) {
        const have = new Set(
          (item.interfaces || item.protocols || []).map((i) => String(i).toUpperCase()),
        );
        if (have.has("DIGITAL")) have.add("GPIO");
        if (have.has("GPIO")) have.add("DIGITAL");
        if (!interfaces.some((i) => have.has(i.toUpperCase()))) return false;
      }
      return true;
    });
  }, [items, categories, voltages, interfaces]);

  async function refreshWorkspaceState(activeWorkspaceId: string) {
    const state = (await api.getEngineeringWorkspaceState(activeWorkspaceId)) as unknown as WorkspaceState;
    applyState(state);
    setCanvas(state.canvas.nodes, state.canvas.edges);
    setDevices(state.canvas.nodes);
  }

  async function addNodeToWorkspace(activeWorkspaceId: string, item: ProItem) {
    const node = await api.addWorkspaceNode(activeWorkspaceId, {
      component_id: item.component_id,
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 220 },
      device_mode: "virtual",
    });
    upsertNode(node as never);
    await refreshWorkspaceState(activeWorkspaceId);
  }

  async function onAdd(item: ProItem) {
    setAddError(null);
    try {
      await addNodeToWorkspace(workspaceId, item);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add component";
      if (message.includes("404") && onWorkspaceRecover) {
        try {
          const newId = await onWorkspaceRecover();
          if (newId) {
            await addNodeToWorkspace(newId, item);
            return;
          }
        } catch (recoverErr) {
          setAddError(recoverErr instanceof Error ? recoverErr.message : message);
          return;
        }
      }
      setAddError(message);
    }
  }

  function voltageText(item: ProItem): string {
    const v = item.voltage;
    if (v?.min != null && v?.max != null) {
      return v.min === v.max ? `${v.min}V` : `${v.min}V-${v.max}V`;
    }
    return item.voltage_v != null ? `${item.voltage_v}V` : "—";
  }

  function ifaceText(item: ProItem): string {
    const list = item.interfaces?.length ? item.interfaces : item.protocols || [];
    return list.slice(0, 3).map(String).join(", ") || "GPIO";
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground" data-testid="component-explorer-pro">
      <div className="space-y-3 border-b border-white/10 px-3 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
            Search Components
          </p>
          <p className="mt-0.5 text-xs text-sidebar-muted">Professional catalog · drag to canvas</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="temperature, dht, wifi, motor…"
            className="border-white/10 bg-white/5 pl-9 text-sidebar-foreground placeholder:text-sidebar-muted"
            aria-label="Search components"
            data-testid="component-search-input"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_FILTERS.map((f) => (
              <label key={f.id} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <input
                  type="checkbox"
                  checked={categories.includes(f.id)}
                  onChange={() => setCategories((prev) => toggleIn(prev, f.id))}
                  className="accent-sky-400"
                  aria-label={`Filter ${f.label}`}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted">Interface</p>
          <div className="flex flex-wrap gap-1.5">
            {INTERFACE_FILTERS.map((iface) => (
              <label key={iface} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <input
                  type="checkbox"
                  checked={interfaces.includes(iface)}
                  onChange={() => setInterfaces((prev) => toggleIn(prev, iface))}
                  className="accent-sky-400"
                  aria-label={`Filter ${iface}`}
                />
                {iface}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted">Voltage</p>
          <div className="flex flex-wrap gap-1.5">
            {VOLTAGE_FILTERS.map((v) => (
              <label key={v.id} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <input
                  type="checkbox"
                  checked={voltages.includes(v.id)}
                  onChange={() => setVoltages((prev) => toggleIn(prev, v.id))}
                  className="accent-sky-400"
                  aria-label={`Filter ${v.label}`}
                />
                {v.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted">
            Controller compatibility
          </p>
          <select
            value={controllerId}
            onChange={(e) => setControllerId(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-sidebar-foreground"
            aria-label="Controller compatibility"
            data-testid="controller-filter"
          >
            {CONTROLLERS.map((c) => (
              <option key={c.id || "any"} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {catalogError ? <p className="text-[10px] text-amber-300">{catalogError}</p> : null}
        {addError ? <p className="text-[10px] text-red-300">{addError}</p> : null}
      </div>

      <div className="hhip-scroll flex-1 space-y-2 overflow-y-auto p-2" data-testid="component-search-results">
        {catalogLoaded && totalKnown === 0 && items.length === 0 && !catalogError ? (
          <p className="px-2 py-6 text-center text-xs text-amber-300" data-testid="empty-no-components-loaded">
            No components loaded
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-sidebar-muted" data-testid="empty-no-matching">
            No matching components found
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.component_id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/hhip-component", item.component_id);
                e.dataTransfer.setData(
                  "application/hhip-component-meta",
                  JSON.stringify({
                    pins: item.pins,
                    voltage: item.voltage,
                    interfaces: item.interfaces || item.protocols,
                    simulation: (item as { simulation?: unknown }).simulation,
                  }),
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
              className={cn(
                "rounded-[12px] border border-white/10 bg-white/[0.04] p-3 text-left shadow-sm",
                "transition hover:border-sky-400/40 hover:bg-white/[0.07]",
              )}
              data-testid={`component-card-${item.component_id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                  <p className="mt-0.5 text-[11px] text-sidebar-muted">{categoryLabel(item)}</p>
                </div>
                <Badge className="bg-sky-500/15 text-[10px] text-sky-200">{voltageText(item)}</Badge>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-sidebar-muted">
                <p>
                  <span className="text-sidebar-foreground/80">Interface:</span> {ifaceText(item)}
                </p>
                <p>
                  <span className="text-sidebar-foreground/80">Voltage:</span> {voltageText(item)}
                </p>
                <p>
                  <span className="text-sidebar-foreground/80">Compatible:</span>{" "}
                  {(item.compatible_controllers || []).slice(0, 4).join(", ") || "ESP32, Arduino, STM32"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(item)}
                className="mt-3 w-full rounded-md bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                data-testid={`add-${item.component_id}`}
              >
                Add To Workspace
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
