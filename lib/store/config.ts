import { create } from "zustand"

interface UiState {
  sqlQueries: string[]
  isDrawerOpen: boolean
  setSqlQueries: (queries: string[]) => void
  openDrawer: () => void
  closeDrawer: () => void
  reset: () => void
}

export const useConfigStore = create<UiState>((set) => ({
  sqlQueries: [],
  isDrawerOpen: false,
  setSqlQueries: (queries) => set({ sqlQueries: queries, isDrawerOpen: queries.length > 0 }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  reset: () => set({ sqlQueries: [], isDrawerOpen: false }),
}))
