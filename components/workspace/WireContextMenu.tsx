"use client";

import { useEffect, useState } from "react";

/** Context menu for a wire (delete / recolor / highlight). */
export function WireContextMenu({
  open,
  x,
  y,
  onDelete,
  onHighlight,
  onClose,
}: {
  open: boolean;
  x: number;
  y: number;
  onDelete?: () => void;
  onHighlight?: () => void;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = () => onClose?.();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed z-50 min-w-[140px] rounded-md border border-border bg-surface py-1 text-[11px] shadow-lg"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="block w-full px-3 py-1.5 text-left hover:bg-muted-bg"
        onClick={() => {
          onHighlight?.();
          onClose?.();
        }}
      >
        Highlight path
      </button>
      <button
        type="button"
        className="block w-full px-3 py-1.5 text-left text-danger hover:bg-muted-bg"
        onClick={() => {
          onDelete?.();
          onClose?.();
        }}
      >
        Delete wire
      </button>
    </div>
  );
}
