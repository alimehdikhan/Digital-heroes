'use client'

import { create } from 'zustand'
import type { Draw, DrawWithMyResult } from '@/types/app'

interface DrawState {
  currentDraw: Draw | null
  draws: Draw[]
  myCurrentResult: DrawWithMyResult['myResult'] | null
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentDraw: (draw: Draw | null) => void
  setDraws: (draws: Draw[]) => void
  setMyResult: (result: DrawWithMyResult['myResult'] | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useDrawStore = create<DrawState>()((set) => ({
  currentDraw: null,
  draws: [],
  myCurrentResult: null,
  isLoading: false,
  error: null,

  setCurrentDraw: (draw) => set({ currentDraw: draw }),
  setDraws: (draws) => set({ draws }),
  setMyResult: (myCurrentResult) => set({ myCurrentResult }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ currentDraw: null, draws: [], myCurrentResult: null, isLoading: false, error: null }),
}))
