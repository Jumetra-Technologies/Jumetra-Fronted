"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  CircuitBoard,
  Cog,
  Cpu,
  Monitor,
  Radio,
  Search,
  ShoppingBag,
  Thermometer,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useDeviceStore } from "@/stores/device-store";
import type { CatalogItem, WorkspaceState } from "@/lib/workspace-types";
import { HARDWARE_ASSETS } from "@/lib/hardware/asset-data";
import { cn } from "@/lib/utils";

const EXPLORER_SECTIONS = [
  { id: "arduino", label: "Arduino", icon: CircuitBoard },
  { id: "esp32", label: "ESP32", icon: Cpu },
  { id: "stm32", label: "STM32", icon: Cpu },
  { id: "pico", label: "Pico", icon: Cpu },
  { id: "sensors", label: "Sensors", icon: Thermometer },
  { id: "actuators", label: "Actuators", icon: Zap },
  { id: "displays", label: "Displays", icon: Monitor },
  { id: "communication", label: "Communication", icon: Radio },
  { id: "ai-modules", label: "AI Modules", icon: Bot },
  { id: "robotics", label: "Robotics", icon: Cog },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/marketplace" },
] as const;

const CONTROLLER_FILTERS = [
  { id: "", label: "All" },
  { id: "arduino", label: "Arduino" },
  { id: "esp32", label: "ESP32" },
  { id: "stm32", label: "STM32" },
  { id: "pico", label: "Pico" },
];

function categoryGlyph(category: string): string {
  const map: Record<string, string> = {
    arduino: "Ⓐ",
    esp32: "Ⓔ",
    stm32: "Ⓢ",
    pico: "Ⓟ",
    sensors: "◉",
    actuators: "◆",
    displays: "▦",
    communication: "📶",
    "ai-modules": "✦",
    robotics: "⚙",
    marketplace: "◆",
  };
  return map[category] ?? "▪";
}

export function ComponentExplorer({
  workspaceId,
  onWorkspaceRecover,
}: {
  workspaceId: string;
  onWorkspaceRecover?: () => Promise<string | null>;
}) {
  const [query, setQuery] = useState("");
  const [controllerFilter, setControllerFilter] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    arduino: true,
    esp32: true,
    sensors: true,
    actuators: true,
  });
  const upsertNode = useWorkspaceStore((s) => s.upsertNode);
  const applyState = useSimulationStore((s) => s.applyState);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const setCanvas = useWorkspaceStore((s) => s.setCanvas);

  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getWorkspaceCatalog({ q: query || undefined })
      .then((data) => {
        setItems(data.items as unknown as CatalogItem[]);
        setCatalogError(null);
      })
      .catch((err) => {
        setItems([]);
        setCatalogError(err instanceof Error ? err.message : "Catalog unavailable");
      });
  }, [query]);

  async function refreshWorkspaceState(activeWorkspaceId: string) {
    const state = (await api.getEngineeringWorkspaceState(activeWorkspaceId)) as unknown as WorkspaceState;
    applyState(state);
    setCanvas(state.canvas.nodes, state.canvas.edges);
    setDevices(state.canvas.nodes);
  }

  async function addNodeToWorkspace(activeWorkspaceId: string, item: CatalogItem) {
    const node = await api.addWorkspaceNode(activeWorkspaceId, {
      component_id: item.component_id,
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 220 },
      device_mode: "virtual",
    });
    upsertNode(node as never);
    await refreshWorkspaceState(activeWorkspaceId);
  }

  async function onAdd(item: CatalogItem) {
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

  const byCategory = useMemo(() => {
    const map: Record<string, CatalogItem[]> = {};
    for (const item of items) {
      const cat = item.category || "sensors";
      if (controllerFilter && ["arduino", "esp32", "stm32", "pico"].includes(cat)) {
        if (cat !== controllerFilter) continue;
      }
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [items, controllerFilter]);

  function toggle(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="space-y-3 border-b border-white/10 px-3 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
            Explorer
          </p>
          <p className="mt-0.5 text-xs text-sidebar-muted">Drag components onto the canvas</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components…"
            className="border-white/10 bg-white/5 pl-9 text-sidebar-foreground placeholder:text-sidebar-muted"
            aria-label="Search components"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CONTROLLER_FILTERS.map((f) => (
            <button
              key={f.id || "all"}
              type="button"
              onClick={() => setControllerFilter(f.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                controllerFilter === f.id
                  ? "bg-primary text-white"
                  : "bg-white/5 text-sidebar-muted hover:bg-white/10 hover:text-white",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {catalogError ? <p className="text-[10px] text-amber-300">{catalogError}</p> : null}
        {addError ? <p className="text-[10px] text-red-300">{addError}</p> : null}
      </div>

      <div className="hhip-scroll flex-1 overflow-y-auto py-1">
        {EXPLORER_SECTIONS.map((section) => {
          const Icon = section.icon;
          const sectionItems = byCategory[section.id] ?? [];
          const isOpen = !!openSections[section.id];
          const isMarketplace = section.id === "marketplace";

          return (
            <div key={section.id} className="border-b border-white/5">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground hover:bg-white/5"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-sidebar-muted" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-sidebar-muted" />
                )}
                <Icon className="h-3.5 w-3.5 text-sky-300" aria-hidden />
                <span>{section.label}</span>
                <span className="ml-auto text-[10px] text-sidebar-muted">{sectionItems.length || ""}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pb-3 pl-3 pr-2">
                      {isMarketplace ? (
                        <Link
                          href="/marketplace"
                          className="mb-1 flex items-center gap-2 rounded-[10px] px-2 py-2 text-xs text-sky-300 hover:bg-white/5"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Open Marketplace →
                        </Link>
                      ) : null}
                      {sectionItems.length === 0 ? (
                        <p className="px-2 py-1 text-xs text-sidebar-muted">No matches</p>
                      ) : (
                        sectionItems.map((item) => (
                          <button
                            key={item.component_id}
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                "application/hhip-component",
                                item.component_id,
                              );
                            }}
                            onClick={() => onAdd(item)}
                            className="group flex w-full items-center gap-2.5 rounded-[10px] border border-transparent bg-white/[0.03] px-2 py-2 text-left transition-all hover:border-white/10 hover:bg-white/5"
                            title="Click or drag onto canvas"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-500/30 to-indigo-600/20 text-sm text-sky-200">
                              {categoryGlyph(section.id)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-white">
                                {item.name}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <Badge
                                  variant="info"
                                  className="bg-white/10 text-[10px] text-sky-100"
                                >
                                  {item.voltage_v ?? "—"}V
                                </Badge>
                                <Badge
                                  variant="success"
                                  className="bg-emerald-500/15 text-[10px] text-emerald-300"
                                >
                                  ready
                                </Badge>
                                {HARDWARE_ASSETS[item.component_id] ? (
                                  <Badge className="bg-violet-500/15 text-[10px] text-violet-300">
                                    SVG
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
