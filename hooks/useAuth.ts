'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

/**
 * useAuth — subscribes to Supabase auth state and syncs to Zustand store.
 * Mount once in the root layout or a top-level providers component.
 */
export function useAuth() {
  const { setSession, setProfile, setLoading, clear } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile ?? null)
      }

      setLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile ?? null)
        }

        if (event === 'SIGNED_OUT') {
          clear()
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return useAuthStore()
}
