import { create } from "zustand";

interface Pet {
  _id: string;
}

type AddVisitState = {
  isOpen: boolean;
  pet: Pet | null;
  onOpen: (pet: Pet) => void;
  onClose: () => void;
};

// Creating a Zustand store for managing the state and actions related to adding a visit.

export const useVisit = create<AddVisitState>((set) => ({
  isOpen: false,
  pet: null,
  onOpen: (pet) => set({ isOpen: true, pet }),
  onClose: () => set({ isOpen: false, pet: null }),
}));
