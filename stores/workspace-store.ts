import { create } from "zustand";
import type { WorkspaceNode, WorkspaceWire } from "@/lib/workspace-types";

interface WorkspaceStore {
  workspaceId: string | null;
  name: string;
  nodes: WorkspaceNode[];
  wires: WorkspaceWire[];
  setWorkspace: (id: string, name: string) => void;
  setCanvas: (nodes: WorkspaceNode[], wires: WorkspaceWire[]) => void;
  upsertNode: (node: WorkspaceNode) => void;
  removeNodes: (ids: string[]) => void;
  setWires: (wires: WorkspaceWire[]) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaceId: null,
  name: "Untitled Workspace",
  nodes: [],
  wires: [],
  setWorkspace: (id, name) => set({ workspaceId: id, name }),
  setCanvas: (nodes, wires) => set({ nodes, wires }),
  upsertNode: (node) =>
    set((s) => {
      const idx = s.nodes.findIndex((n) => n.id === node.id);
      if (idx >= 0) {
        const next = [...s.nodes];
        next[idx] = node;
        return { nodes: next };
      }
      return { nodes: [...s.nodes, node] };
    }),
  removeNodes: (ids) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      wires: s.wires.filter((w) => !ids.includes(w.source) && !ids.includes(w.target)),
    })),
  setWires: (wires) => set({ wires }),
}));
