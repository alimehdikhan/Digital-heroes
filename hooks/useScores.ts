'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useScoresStore } from '@/store/scoresStore'
import type { AddScoreInput } from '@/validators/score'

export function useScores() {
  const store = useScoresStore()
  const supabase = createClient()

  const fetchScores = useCallback(async () => {
    store.setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)

      if (error) throw new Error(error.message)
      store.setScores(data ?? [])
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Failed to load scores')
    } finally {
      store.setLoading(false)
    }
  }, [supabase, store])

  const addScore = useCallback(async (input: AddScoreInput) => {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    store.addScore(json.data)
    return json.data
  }, [store])

  const removeScore = useCallback(async (scoreId: string) => {
    const res = await fetch(`/api/scores/${scoreId}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    store.removeScore(scoreId)
  }, [store])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  return {
    scores: store.scores,
    scoresWithTrend: store.scoresWithTrend,
    isLoading: store.isLoading,
    error: store.error,
    addScore,
    removeScore,
    refetch: fetchScores,
  }
}
