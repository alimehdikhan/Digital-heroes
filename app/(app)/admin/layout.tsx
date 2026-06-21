import { createClient } from '@/lib/supabase/server'
import { redirect, headers } from 'next/navigation'
import Link from 'next/link'

const navLinks = [
  { href: '/admin', label: 'Command Center', icon: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 0h3v7h-3v-7z' },
  { href: '/admin/users', label: 'Users', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { href: '/admin/draws', label: 'Draws', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { href: '/admin/charities', label: 'Charities', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  { href: '/admin/scores', label: 'Scores', icon: 'M12 20V10M18 20V4M6 20v-4' },
  { href: '/admin/organizations', label: 'Teams', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { href: '/admin/reports', label: 'Reports', icon: 'M18 20V10M12 20V4M6 20v-6' },
]

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

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  // Read current pathname from headers to determine active nav link
  const pathname = headers().get('x-next-url') || headers().get('referer') || ''
  const currentPath = pathname.replace(/^https?:\/\/[^/]+/, '') || '/admin'

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 shrink-0">
        <nav className="glass-card rounded-2xl border border-white/10 p-4 space-y-1 sticky top-24">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-body px-3 pt-1 pb-2">Admin Panel</p>
          {navLinks.map((link) => {
            const isActive = link.href === '/admin'
              ? (currentPath === '/admin' || currentPath === '/admin/')
              : currentPath.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${isActive ? 'text-gold-400 bg-gold-400/10' : 'text-white/60 hover:text-gold-400 hover:bg-white/5'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg>
                <span className="text-[11px] uppercase tracking-widest font-bold">{link.label}</span>
              </Link>
            )
          })}
          <div className="pt-2 mt-2 border-t border-white/10">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              <span className="text-[11px] uppercase tracking-widest font-bold">Back to Arena</span>
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
