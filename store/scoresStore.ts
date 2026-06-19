'use client'

import { create } from 'zustand'
import type { Score, ScoreWithTrend } from '@/types/app'

interface ScoresState {
  scores: Score[]
  isLoading: boolean
  error: string | null

  // Computed
  scoresWithTrend: ScoreWithTrend[]

  // Actions
  setScores: (scores: Score[]) => void
  addScore: (score: Score) => void
  removeScore: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

function computeTrends(scores: Score[]): ScoreWithTrend[] {
  // Sorted newest first
  const sorted = [...scores].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return sorted.map((score, idx) => {
    const prev = sorted[idx + 1]
    let trend: ScoreWithTrend['trend'] = null
    if (prev) {
      if (score.score > prev.score) trend = 'up'
      else if (score.score < prev.score) trend = 'down'
      else trend = 'same'
    }
    return { ...score, trend }
  })
}

export const useScoresStore = create<ScoresState>()((set, get) => ({
  scores: [],
  isLoading: false,
  error: null,

  get scoresWithTrend() {
    return computeTrends(get().scores)
  },

  setScores: (scores) => set({ scores, error: null }),

  addScore: (score) =>
    set((state) => {
      // Enforce max 5 client-side (DB trigger handles it server-side)
      const updated = [score, ...state.scores]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
      return { scores: updated }
    }),

  removeScore: (id) =>
    set((state) => ({ scores: state.scores.filter((s) => s.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ scores: [], isLoading: false, error: null }),
}))
