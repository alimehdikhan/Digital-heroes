"use client"

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (variant === 'mobile') {
    return (
      <button 
        onClick={handleLogout} 
        disabled={isLoggingOut}
        className="flex flex-col items-center justify-center text-white/50 hover:bg-white/5 rounded-xl p-2 px-4 active:scale-95 transition-all disabled:opacity-50"
      >
        <LogOut size={24} />
        <span className="font-body text-[10px] mt-1 font-bold uppercase tracking-wider">Logout</span>
      </button>
    )
  }

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoggingOut}
      className="text-white/50 hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut size={20} />
    </button>
  )
}
