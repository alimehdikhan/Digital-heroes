import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signout } from '@/app/actions/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Fetch unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <div className="min-h-dvh flex flex-col bg-navy-950 text-white font-body relative overflow-x-hidden">
      {/* Noise and Light Leaks */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVaKmpGt33NF21LUYI3axFKIUC95Gs-Af7oi2lY64PqmTv9GpgnExOx3AiNta-fH_MLgBMLpQZQUBe7_dplbPS471Rwq1T2CiOD5UXrS5TMDv3afN9aiMjxOJTd7Y6WHLr8rT-BIfNqIa2yI24BQkqg3pXSGj3XmaK8AfsjLbreRa1QKRk0reiv8OdecMwsPbizqfWcr8SQXETlWWa687mktwab7JKtRlVx7ZrRBlzNmHjnb8KCC_2HXaqMEU24CpgQL2EucKLuQ')] bg-repeat" />
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gold-400/10 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-40 bg-navy-950/50 backdrop-blur-[20px] border-b border-white/10 shadow-emerald-glow h-20 px-4 md:px-8 lg:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <Link href="/dashboard" className="font-display text-2xl text-gold-400 tracking-tight font-bold">The Arena</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <Link href="/dashboard" className="font-body text-xs uppercase tracking-widest font-bold text-gold-400">Dashboard</Link>
            <Link href="/scores" className="font-body text-xs uppercase tracking-widest font-bold text-white/50 hover:text-gold-400 transition-colors">Scores</Link>
            <Link href="/draws" className="font-body text-xs uppercase tracking-widest font-bold text-white/50 hover:text-gold-400 transition-colors">Draws</Link>
            <Link href="/profile" className="font-body text-xs uppercase tracking-widest font-bold text-white/50 hover:text-gold-400 transition-colors">Hero Profile</Link>
            {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
              <a href="/console" className="font-body text-xs uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Admin Console</a>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative text-white/50 hover:text-gold-400 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              {unreadCount && unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              ) : null}
            </Link>
            <form action={signout}>
              <button type="submit" className="text-white/50 hover:text-white transition-colors">
                <LogOut size={20} />
              </button>
            </form>
            <Link href="/profile" className="w-10 h-10 rounded-xl border border-gold-400/30 flex items-center justify-center overflow-hidden bg-navy-900 hover:scale-105 hover:border-gold-400/60 transition-all cursor-pointer">
              <span className="font-display font-bold text-gold-400">{profile?.name?.charAt(0) || 'H'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-32 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-navy-950/80 backdrop-blur-[20px] border-t border-white/10 shadow-2xl flex justify-around items-center px-4 py-3 pb-safe rounded-t-3xl">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-gold-400 bg-gold-400/10 rounded-xl p-2 px-4 active:scale-95 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          <span className="font-body text-[10px] mt-1 font-bold uppercase tracking-wider">Arena</span>
        </Link>
        <Link href="/scores" className="flex flex-col items-center justify-center text-white/50 hover:bg-white/5 rounded-xl p-2 px-4 active:scale-95 transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          <span className="font-body text-[10px] mt-1 font-bold uppercase tracking-wider">Scores</span>
        </Link>
        <Link href="/draws" className="flex flex-col items-center justify-center text-white/50 hover:bg-white/5 rounded-xl p-2 px-4 active:scale-95 transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          <span className="font-body text-[10px] mt-1 font-bold uppercase tracking-wider">Draws</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-white/50 hover:bg-white/5 rounded-xl p-2 px-4 active:scale-95 transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="font-body text-[10px] mt-1 font-bold uppercase tracking-wider">Hero</span>
        </Link>
      </nav>
    </div>
  )
}
