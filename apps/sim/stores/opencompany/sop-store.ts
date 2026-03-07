import { create } from 'zustand'

export interface SOPViolation {
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

interface SOPStore {
  violations: SOPViolation[]
  addViolation: (violation: SOPViolation) => void
  clear: () => void
}

export const useSOPStore = create<SOPStore>((set) => ({
  violations: [],
  addViolation: (violation) =>
    set((state) => ({
      violations: [violation, ...state.violations].slice(0, 100),
    })),
  clear: () => set({ violations: [] }),
}))
