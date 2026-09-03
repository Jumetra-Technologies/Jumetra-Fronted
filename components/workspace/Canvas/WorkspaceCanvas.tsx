"use client";

import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { HardwareNode, type HardwareNodeData } from "@/components/workspace/Canvas/hardware/HardwareNode";
import { LiveWire } from "@/components/workspace/LiveWire";
import { getHardwareAssetOrFallback, getPinById } from "@/lib/hardware/registry";
import { inferWireProtocol, signalColor } from "@/lib/hardware/signal-colors";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSelectionStore } from "@/stores/selection-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useDeviceStore } from "@/stores/device-store";
import { useUIStore } from "@/stores/ui-store";
import { inferBusFromHandles, validateLiveConnection } from "@/lib/hardware/connection-validation";
import type { WorkspaceNode, WorkspaceState, WorkspaceWire } from "@/lib/workspace-types";

const nodeTypes = { hardware: HardwareNode };
const edgeTypes = { signal: LiveWire };

function toFlowNodes(nodes: WorkspaceNode[], selectedIds: string[]): Node<HardwareNodeData>[] {
  return nodes.map((n) => {
    const asset = getHardwareAssetOrFallback(n.component_id);
    return {
      id: n.id,
      type: "hardware",
      position: n.position,
      selected: selectedIds.includes(n.id),
      data: { workspaceNode: n },
      style: { width: asset.metadata.width, height: asset.metadata.height, padding: 0, border: "none", background: "transparent" },
    };
  });
}

function toFlowEdges(wires: WorkspaceWire[]): Edge[] {
  return wires.map((w) => ({
    id: w.id,
    type: "signal",
    source: w.source,
    target: w.target,
    sourceHandle: w.sourceHandle,
    targetHandle: w.targetHandle,
    label: w.bus?.address ? `${w.bus.type} ${w.bus.address}` : w.label,
    animated: w.valid !== false,
    style: { stroke: w.valid === false ? "#dc2626" : w.color ?? signalColor(w.protocol), strokeWidth: 2.5 },
    data: {
      protocol: w.protocol,
      color: w.valid === false ? "#dc2626" : w.color ?? signalColor(w.protocol),
      valid: w.valid,
      issues: w.issues,
      bus: w.bus,
    },
  }));
}

function CanvasInner({ workspaceId }: { workspaceId: string }) {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const wires = useWorkspaceStore((s) => s.wires);
  const setCanvas = useWorkspaceStore((s) => s.setCanvas);
  const setSelection = useSelectionStore((s) => s.setSelection);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const applyState = useSimulationStore((s) => s.applyState);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const snapGrid = useUIStore((s) => s.snapGrid);
  const wireToolActive = useUIStore((s) => s.wireToolActive);
  const wiringSource = useUIStore((s) => s.wiringSource);
  const setWiringSource = useUIStore((s) => s.setWiringSource);
  const setOnPinClick = useUIStore((s) => s.setOnPinClick);
  const breadboardMode = useUIStore((s) => s.breadboardMode);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(toFlowNodes(nodes, selectedIds));
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(toFlowEdges(wires));

  useEffect(() => {
    setFlowNodes(toFlowNodes(nodes, selectedIds));
  }, [nodes, selectedIds, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(toFlowEdges(wires));
  }, [wires, setFlowEdges]);

  const applyServerState = useCallback(
    (state: WorkspaceState) => {
      applyState(state);
      const canvasNodes = (state.canvas?.nodes ?? []) as WorkspaceNode[];
      const canvasWires = (state.canvas?.edges ?? []) as WorkspaceWire[];
      setCanvas(canvasNodes, canvasWires);
      setDevices(canvasNodes);
    },
    [applyState, setCanvas, setDevices],
  );

  const [connectionHint, setConnectionHint] = useState<string | null>(null);
  const [connectionValid, setConnectionValid] = useState(true);

  const connectPins = useCallback(
    async (sourceNodeId: string, sourcePinId: string, targetNodeId: string, targetPinId: string) => {
      const srcNode = nodes.find((n) => n.id === sourceNodeId);
      const tgtNode = nodes.find((n) => n.id === targetNodeId);
      if (!srcNode || !tgtNode) return;
      const srcAsset = getHardwareAssetOrFallback(
        srcNode.component_id,
        srcNode.properties?.catalog_pins as never,
      );
      const tgtAsset = getHardwareAssetOrFallback(
        tgtNode.component_id,
        tgtNode.properties?.catalog_pins as never,
      );
      const srcPin = getPinById(srcAsset, sourcePinId);
      const tgtPin = getPinById(tgtAsset, targetPinId);
      const check = validateLiveConnection(srcPin, tgtPin, {
        sourceLabel: `${srcNode.component_id} ${sourcePinId}`,
        targetMaxV: Number((tgtNode.properties?.voltage as { max?: number } | undefined)?.max ?? tgtPin?.voltage ?? 3.3),
      });
      if (!check.valid) {
        setConnectionHint(check.reason || "Invalid connection");
        setConnectionValid(false);
        return;
      }
      setConnectionHint(null);
      setConnectionValid(true);
      const protocol = inferWireProtocol(
        srcPin?.interfaces.map(String) ?? ["digital"],
        tgtPin?.interfaces.map(String) ?? ["digital"],
      );
      const bus = inferBusFromHandles(sourcePinId, targetPinId);
      try {
        await api.addWorkspaceWire(workspaceId, {
          source: sourceNodeId,
          target: targetNodeId,
          source_handle: sourcePinId,
          target_handle: targetPinId,
          protocol: bus?.type.toLowerCase() || protocol,
          voltage_v: srcPin?.voltage ?? tgtPin?.voltage ?? 3.3,
        });
        // Sprint 30 — auto hybrid mapping (physical↔virtual / any↔any)
        const srcKind = srcNode.device_mode === "physical" ? "physical" : "virtual";
        const tgtKind = tgtNode.device_mode === "physical" ? "physical" : "virtual";
        try {
          await api.createWorkspaceConnection({
            source_device: sourceNodeId,
            source_pin: sourcePinId,
            destination_device: targetNodeId,
            destination_pin: targetPinId,
            wire_type: bus?.type.toLowerCase() || protocol,
            workspace_id: workspaceId,
            auto: true,
            drag: true,
            source_kind: srcKind,
            destination_kind: tgtKind,
            source_pin_type: String(srcPin?.interfaces?.[0] || "GPIO").toUpperCase(),
            destination_pin_type: String(tgtPin?.interfaces?.[0] || "GPIO").toUpperCase(),
            source_voltage: srcPin?.voltage ?? 3.3,
            destination_voltage: tgtPin?.voltage ?? 3.3,
          });
        } catch {
          /* validation rejected hybrid wire — canvas wire may still exist */
        }
        const state = (await api.getEngineeringWorkspaceState(workspaceId)) as unknown as WorkspaceState;
        applyServerState(state);
      } catch {
        /* validation failed */
      }
    },
    [nodes, workspaceId, applyServerState],
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const source = connection.source;
      const target = connection.target;
      const sourceHandle = connection.sourceHandle ?? null;
      const targetHandle = connection.targetHandle ?? null;
      if (!source || !target || !sourceHandle || !targetHandle) {
        return false;
      }
      if (source === target && sourceHandle === targetHandle) {
        return false;
      }
      const srcNode = nodes.find((n) => n.id === source);
      const tgtNode = nodes.find((n) => n.id === target);
      if (!srcNode || !tgtNode) return false;
      const srcAsset = getHardwareAssetOrFallback(srcNode.component_id, srcNode.properties?.catalog_pins as never);
      const tgtAsset = getHardwareAssetOrFallback(tgtNode.component_id, tgtNode.properties?.catalog_pins as never);
      const srcPin = getPinById(srcAsset, sourceHandle);
      const tgtPin = getPinById(tgtAsset, targetHandle);
      const result = validateLiveConnection(srcPin, tgtPin, {
        sourceLabel: `${srcNode.component_id} ${sourceHandle}`,
        targetMaxV: Number((tgtNode.properties?.voltage as { max?: number } | undefined)?.max ?? tgtPin?.voltage ?? 3.3),
      });
      setConnectionValid(result.valid);
      setConnectionHint(result.valid ? null : result.reason || "Invalid connection");
      return result.valid;
    },
    [nodes],
  );

  useEffect(() => {
    setOnPinClick(async (nodeId, pinId) => {
      if (!wireToolActive && !wiringSource) return;
      if (!wiringSource) {
        const n = nodes.find((x) => x.id === nodeId);
        const asset = getHardwareAssetOrFallback(n?.component_id ?? "");
        const p = getPinById(asset, pinId);
        setWiringSource({
          nodeId,
          pinId,
          protocol: p?.interfaces[0] ?? "digital",
        });
        return;
      }
      if (wiringSource.nodeId === nodeId && wiringSource.pinId === pinId) {
        setWiringSource(null);
        return;
      }
      await connectPins(wiringSource.nodeId, wiringSource.pinId, nodeId, pinId);
      setWiringSource(null);
    });
    return () => setOnPinClick(null);
  }, [wireToolActive, wiringSource, nodes, connectPins, setWiringSource, setOnPinClick]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      await connectPins(
        connection.source,
        connection.sourceHandle ?? "out",
        connection.target,
        connection.targetHandle ?? "in",
      );
    },
    [connectPins],
  );

  const onSelectionChange = useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelection(sel.map((n) => n.id));
    },
    [setSelection],
  );

  const onNodeDragStop = useCallback(
    async (_: unknown, node: Node) => {
      try {
        await api.updateWorkspaceNode(workspaceId, node.id, {
          position: { x: node.position.x, y: node.position.y },
        });
      } catch {
        /* ignore */
      }
    },
    [workspaceId],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const componentId = e.dataTransfer.getData("application/hhip-component");
      if (!componentId || !reactFlowWrapper.current) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      try {
        const created = await api.addWorkspaceNode(workspaceId, {
          component_id: componentId,
          position,
          device_mode: "virtual",
        });
        useWorkspaceStore.getState().upsertNode(created as never);
        const state = (await api.getEngineeringWorkspaceState(workspaceId)) as unknown as WorkspaceState;
        applyServerState(state);
      } catch {
        /* ignore */
      }
    },
    [workspaceId, screenToFlowPosition, applyServerState],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "Escape") setWiringSource(null);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        api.undoWorkspace(workspaceId).then((s) => applyServerState(s as unknown as WorkspaceState));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        api.redoWorkspace(workspaceId).then((s) => applyServerState(s as unknown as WorkspaceState));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedIds.length) {
          api.duplicateWorkspaceNodes(workspaceId, selectedIds).then(async () => {
            const s = (await api.getEngineeringWorkspaceState(workspaceId)) as unknown as WorkspaceState;
            applyServerState(s);
          });
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length) {
          api.deleteWorkspaceNodes(workspaceId, selectedIds).then(async () => {
            const s = (await api.getEngineeringWorkspaceState(workspaceId)) as unknown as WorkspaceState;
            applyServerState(s);
          });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [workspaceId, selectedIds, applyServerState, setWiringSource]);

  const defaultEdgeOptions = useMemo(() => ({ type: "signal" as const }), []);

  return (
    <motion.div
      ref={reactFlowWrapper}
      className="hhip-canvas-grid h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {breadboardMode && (
        <div className="pointer-events-none absolute left-3 top-12 z-10 rounded-[10px] border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800 shadow-sm">
          Breadboard Mode · Row connectivity active
        </div>
      )}
      {wiringSource && (
        <div className="pointer-events-none absolute right-3 top-12 z-10 rounded-[10px] border border-primary bg-accent px-2.5 py-1 text-[10px] font-semibold text-primary shadow-sm">
          Wiring: {wiringSource.pinId} → click target pin (Esc to cancel)
        </div>
      )}
      {connectionHint && (
        <div
          className="pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 rounded-[10px] border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-sm"
          data-testid="connection-validation-tooltip"
        >
          {connectionHint}
        </div>
      )}
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={onNodeDragStop}
        fitView
        snapToGrid={snapGrid}
        snapGrid={[16, 16]}
        multiSelectionKeyCode="Shift"
        selectionOnDrag={!wireToolActive}
        panOnDrag={!wireToolActive}
        nodesConnectable={wireToolActive}
        connectionLineStyle={{
          stroke: connectionValid ? "#16a34a" : "#dc2626",
          strokeWidth: 2.5,
        }}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap pannable zoomable nodeColor="#93C5FD" maskColor="rgba(248,250,252,0.7)" />
        <Controls showInteractive />
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} color="#CBD5E1" />
      </ReactFlow>
    </motion.div>
  );
}

export function WorkspaceCanvas({ workspaceId }: { workspaceId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner workspaceId={workspaceId} />
    </ReactFlowProvider>
  );
}
