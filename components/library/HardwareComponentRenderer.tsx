"use client";

import { useMemo, useState } from "react";
import { Handle, Position, ReactFlowProvider } from "@xyflow/react";
import { api } from "@/lib/api-client";
import type { ComponentV2Pin, ComponentV2SearchHit } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  component: Pick<ComponentV2SearchHit, "id" | "name" | "visual" | "pins">;
  selected?: boolean;
  interactivePins?: boolean;
  useFlowHandles?: boolean;
  className?: string;
  liveState?: Record<string, unknown>;
};

function sideFromPosition(pin: ComponentV2Pin, width: number, height: number): Position {
  const x = pin.position?.x ?? 0;
  const y = pin.position?.y ?? height / 2;
  if (x <= width * 0.2) return Position.Left;
  if (x >= width * 0.8) return Position.Right;
  if (y <= height * 0.2) return Position.Top;
  return Position.Bottom;
}

function RendererInner({
  component,
  selected,
  interactivePins = true,
  useFlowHandles = false,
  className,
  liveState,
}: Props) {
  const width = Number(component.visual?.width ?? 140);
  const height = Number(component.visual?.height ?? 100);
  const src = api.getComponentV2RendererUrl(component.id);
  const [hover, setHover] = useState<ComponentV2Pin | null>(null);
  const pins = useMemo(() => component.pins || [], [component.pins]);

  return (
    <div
      className={cn("relative select-none", selected && "ring-2 ring-sky-400 rounded-lg", className)}
      style={{ width, height }}
      data-testid={`hw-renderer-${component.id}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={component.name}
        width={width}
        height={height}
        className="pointer-events-none h-full w-full rounded-lg object-contain"
        draggable={false}
      />
      {liveState?.temperature != null || liveState?.temperature_c != null ? (
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300">
          {String(liveState.temperature ?? liveState.temperature_c)}°C
        </div>
      ) : null}
      {interactivePins
        ? pins.map((pin) => {
            const left = ((pin.position?.x ?? 0) / width) * 100;
            const top = ((pin.position?.y ?? 0) / height) * 100;
            const fill =
              pin.type === "POWER" ? "#EF4444" : pin.type === "GROUND" ? "#64748B" : "#38BDF8";
            if (useFlowHandles) {
              return (
                <Handle
                  key={pin.id}
                  id={pin.id}
                  type={pin.direction === "INPUT" ? "target" : "source"}
                  position={sideFromPosition(pin, width, height)}
                  title={`${pin.name} · ${pin.voltage ?? "—"}V · ${pin.type}`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: fill,
                    border: "1.5px solid white",
                    zIndex: 5,
                  }}
                  onMouseEnter={() => setHover(pin)}
                  onMouseLeave={() => setHover(null)}
                  data-testid={`pin-handle-${pin.id}`}
                />
              );
            }
            return (
              <button
                key={pin.id}
                type="button"
                title={`${pin.name} · ${pin.voltage ?? "—"}V · ${pin.type}`}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
                style={{ left: `${left}%`, top: `${top}%`, background: fill }}
                onMouseEnter={() => setHover(pin)}
                onMouseLeave={() => setHover(null)}
                data-testid={`pin-handle-${pin.id}`}
              />
            );
          })
        : null}
      {hover ? (
        <div
          className="pointer-events-none absolute z-20 rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 shadow-lg"
          style={{
            left: Math.min(width - 120, Math.max(0, (hover.position?.x ?? 0) + 8)),
            top: Math.max(0, (hover.position?.y ?? 0) - 28),
          }}
          data-testid="pin-hover-tooltip"
        >
          <div className="font-semibold">{hover.name}</div>
          <div className="text-slate-400">
            {hover.voltage ?? "—"}V · {hover.type}
            {hover.capabilities?.length ? ` · ${hover.capabilities.join(",")}` : ""}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HardwareComponentRenderer(props: Props) {
  if (props.useFlowHandles) {
    return (
      <ReactFlowProvider>
        <RendererInner {...props} />
      </ReactFlowProvider>
    );
  }
  return <RendererInner {...props} />;
}
