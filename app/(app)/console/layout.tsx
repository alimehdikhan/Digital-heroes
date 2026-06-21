import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Server-side admin authorization check
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log("CONSOLE LAYOUT CHECK - profile:", profile)

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
