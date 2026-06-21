import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log("ADMIN LAYOUT CHECK - profile:", profile)

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return (
      <div className="p-10 bg-red-500/20 text-white rounded-xl font-mono text-sm m-10 border border-red-500">
        <h2 className="text-xl font-bold mb-4">Admin Auth Failed</h2>
        <p>This is a debug screen. Please send a screenshot of this to your AI.</p>
        <p className="mt-4">User ID: {user?.id}</p>
        <pre className="mt-4 bg-navy-950 p-4 rounded overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    )
  }

  return <>{children}</>
}
