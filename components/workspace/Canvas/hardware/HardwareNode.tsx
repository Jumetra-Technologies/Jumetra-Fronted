"use client";

import { memo, useCallback } from "react";
import { Handle, Position, useViewport, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { ComponentSvg } from "./ComponentSvg";
import { getHardwareAssetOrFallback, getConnectedWiresForPin } from "@/lib/hardware/registry";
import { zoomDetailLevel } from "@/lib/hardware/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useUIStore } from "@/stores/ui-store";
import { useSelectionStore } from "@/stores/selection-store";
import type { WorkspaceNode } from "@/lib/workspace-types";
import { cn } from "@/lib/utils";

export type HardwareNodeData = {
  workspaceNode: WorkspaceNode;
};

function sideToPosition(side: string): Position {
  switch (side) {
    case "left":
      return Position.Left;
    case "right":
      return Position.Right;
    case "top":
      return Position.Top;
    case "bottom":
      return Position.Bottom;
    default:
      return Position.Right;
  }
}

function HardwareNodeComponent({ id, data, selected }: NodeProps & { data: HardwareNodeData }) {
  const node = data.workspaceNode;
  const catalogPins = node.properties?.catalog_pins as Array<{ name?: string; type?: string }> | undefined;
  const voltageHint =
    typeof (node.properties?.voltage as { max?: number } | undefined)?.max === "number"
      ? (node.properties.voltage as { max: number }).max
      : undefined;
  const asset = getHardwareAssetOrFallback(node.component_id, catalogPins, voltageHint);
  const { zoom } = useViewport();
  const zoomDetail = zoomDetailLevel(zoom);
  const wires = useWorkspaceStore((s) => s.wires);
  const wireToolActive = useUIStore((s) => s.wireToolActive);
  const wiringSource = useUIStore((s) => s.wiringSource);
  const hoveredPin = useUIStore((s) => s.hoveredPin);
  const setHoveredPin = useUIStore((s) => s.setHoveredPin);
  const onPinClickHandler = useUIStore((s) => s.onPinClick);
  const setWiringSource = useUIStore((s) => s.setWiringSource);
  const selectedPin = useSelectionStore((s) => s.selectedPin);
  const setSelectedPin = useSelectionStore((s) => s.setSelectedPin);

  const connectedPins = new Set<string>();
  for (const p of asset.pins) {
    const cw = getConnectedWiresForPin(id, p.id, wires);
    if (cw.length) connectedPins.add(p.id);
  }

  const handlePinClick = useCallback(
    (pinId: string) => {
      setSelectedPin({ nodeId: id, pinId });
      if (onPinClickHandler) {
        onPinClickHandler(id, pinId);
        return;
      }
      if (wireToolActive) {
        setWiringSource({ nodeId: id, pinId, protocol: "digital" });
      }
    },
    [id, onPinClickHandler, setSelectedPin, setWiringSource, wireToolActive],
  );

  const isSourcePin =
    wiringSource?.nodeId === id && wiringSource?.pinId ? true : false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative",
        selected && "ring-2 ring-primary ring-offset-2 rounded-[12px]",
        !node.available && "opacity-80",
      )}
      style={{ width: asset.metadata.width, height: asset.metadata.height }}
    >
      <ComponentSvg
        asset={asset}
        node={node}
        zoomDetail={zoomDetail}
        hoveredPin={hoveredPin?.nodeId === id ? hoveredPin.pinId : null}
        selectedPin={selectedPin?.nodeId === id ? selectedPin.pinId : null}
        connectedPins={connectedPins}
      />

      {asset.pins.map((p) => {
        const isHovered = hoveredPin?.nodeId === id && hoveredPin.pinId === p.id;
        const isSelected = selectedPin?.nodeId === id && selectedPin.pinId === p.id;
        const isWiring = wiringSource?.nodeId === id && wiringSource.pinId === p.id;
        return (
          <Handle
            key={p.id}
            id={p.id}
            type={p.signal === "output" ? "source" : p.signal === "input" ? "target" : "source"}
            position={sideToPosition(p.side)}
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isWiring ? "#F59E0B" : isSelected ? "#2563EB" : isHovered ? "#FBBF24" : "transparent",
              border: isHovered || isSelected || isWiring ? "2px solid white" : "2px solid transparent",
              opacity: wireToolActive || isHovered || isSelected || connectedPins.has(p.id) ? 1 : 0.01,
              zIndex: 10,
              cursor: "crosshair",
            }}
            isConnectable={wireToolActive}
            onMouseEnter={() => setHoveredPin({ nodeId: id, pinId: p.id })}
            onMouseLeave={() => setHoveredPin(null)}
            onClick={(e) => {
              e.stopPropagation();
              handlePinClick(p.id);
            }}
          />
        );
      })}

      {zoomDetail === "outline" && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-surface/90 px-1.5 py-0.5 text-[9px] font-medium text-muted shadow-sm">
          {node.label}
        </div>
      )}

      {isSourcePin && (
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
          Select target pin
        </div>
      )}
    </motion.div>
  );
}

export const HardwareNode = memo(HardwareNodeComponent);
