import { create } from "zustand"

interface Vaccination {
  date: Date
  vaccinationType: string
}

type Pet = {
  _id: string
  name: string
  vaccinationHistory: Vaccination[]
  status: string
}

type PetDetailsStore = {
  isOpen: boolean
  pet: Pet | null
  onOpen: (pet: Pet) => void
  onClose: () => void
}

// useEditDetails

export const useEditDetails = create<PetDetailsStore>((set) => ({
  isOpen: false,
  pet: null,
  onOpen: (pet) => {
    set({ isOpen: true, pet: pet })
  },
  onClose: () => set({ isOpen: false, pet: null }),
}))
