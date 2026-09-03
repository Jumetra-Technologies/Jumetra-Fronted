"use client";

import { BoardHealthBadge } from "./BoardHealthBadge";
import type { WorkspaceHardwareNode } from "./hardware-types";

/** Overlay shown when a persisted board is offline / waiting. */
export function ConnectionOverlay({ node }: { node: WorkspaceHardwareNode }) {
  if (node.status !== "waiting" && node.available !== false) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 backdrop-blur-[1px]">
      <BoardHealthBadge status="waiting" />
      <p className="text-xs font-medium text-foreground">Waiting for hardware</p>
      <p className="max-w-[200px] text-center text-[10px] text-muted">
        {node.board_type}
        {node.endpoint ? ` @ ${node.endpoint}` : ""} will reconnect automatically when detected.
      </p>
    </div>
  );
}
