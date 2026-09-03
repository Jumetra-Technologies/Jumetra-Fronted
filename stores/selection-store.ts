import { create } from "zustand";
import type { PinSelection } from "@/lib/hardware/types";

interface SelectionStore {
  selectedIds: string[];
  clipboard: string[];
  selectedPin: PinSelection | null;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setClipboard: (ids: string[]) => void;
  setSelectedPin: (pin: PinSelection | null) => void;
  clearSelectedPin: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedIds: [],
  clipboard: [],
  selectedPin: null,
  setSelection: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [], selectedPin: null }),
  setClipboard: (ids) => set({ clipboard: ids }),
  setSelectedPin: (pin) => set({ selectedPin: pin }),
  clearSelectedPin: () => set({ selectedPin: null }),
}));
