'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/app'

interface AuthState {
  // Raw Supabase auth
  user: User | null
  session: Session | null

  // App-level profile (from profiles table)
  profile: Profile | null

  // Computed flags
  isLoading: boolean
  isAuthenticated: boolean
  isSubscribed: boolean
  isAdmin: boolean
  isSuperAdmin: boolean

  // Actions
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,

      get isAuthenticated() {
        return !!get().user
      },
      get isSubscribed() {
        const status = get().profile?.subscriptionStatus
        return status === 'active' || status === 'trialing'
      },
      get isAdmin() {
        const role = get().profile?.role
        return role === 'admin' || role === 'super_admin'
      },
      get isSuperAdmin() {
        return get().profile?.role === 'super_admin'
      },

      setSession: (session) =>
        set({ session, user: session?.user ?? null }),

      setProfile: (profile) =>
        set({ profile }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      clear: () =>
        set({ user: null, session: null, profile: null, isLoading: false }),
    }),
    {
      name: 'dh-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the profile (not session — that's handled by Supabase cookies)
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
