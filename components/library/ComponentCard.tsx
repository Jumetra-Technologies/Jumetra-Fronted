"use client";

import { api } from "@/lib/api-client";
import type { ComponentV2SearchHit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  item: ComponentV2SearchHit;
  onAdd?: (item: ComponentV2SearchHit) => void;
  onSelect?: (item: ComponentV2SearchHit) => void;
  selected?: boolean;
};

export function ComponentCard({ item, onAdd, onSelect, selected }: Props) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-white/10 bg-white/[0.04] p-3 text-left shadow-sm transition hover:border-sky-400/40",
        selected && "border-sky-400/60 bg-sky-500/10",
      )}
      data-testid={`v2-card-${item.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/hhip-component", item.id);
        e.dataTransfer.setData("application/hhip-component-v2", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onSelect?.(item)}
    >
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={api.getComponentV2RendererUrl(item.id)}
          alt={item.name}
          width={56}
          height={40}
          className="h-10 w-14 rounded-md bg-black/20 object-contain"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{item.name}</h3>
          <p className="text-[11px] capitalize text-sidebar-muted">{item.category}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(item.interfaces || []).slice(0, 3).map((iface) => (
              <Badge key={iface} className="bg-white/10 text-[9px] text-sky-100">
                {iface}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-sidebar-muted">
        Pins: {(item.pins || []).map((p) => p.name).join(", ") || "—"}
      </p>
      {onAdd ? (
        <button
          type="button"
          className="mt-2 w-full rounded-md bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
          data-testid={`v2-add-${item.id}`}
        >
          + Add to Workspace
        </button>
      ) : null}
    </div>
  );
}
