import { create } from "zustand";
import type { Pet } from "../lib/types";
type State = {
  isOpen: boolean;
  pet: Pet | null;
  onOpen: (pet: Pet) => void;
  onClose: () => void;
};
export const useVisit = create<State>((set) => ({
  isOpen: false,
  pet: null,
  onOpen: (pet) => set({ isOpen: true, pet }),
  onClose: () => set({ isOpen: false, pet: null }),
}));
