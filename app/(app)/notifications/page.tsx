import { createClient } from '@/lib/supabase/server'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Mark all as read when they visit the page
  if (notifications?.some(n => !n.read)) {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SlideUp className="pt-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 border border-gold-400/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <h1 className="font-display text-4xl text-white font-bold">Secure Transmissions</h1>
        </div>
        <p className="text-white/50 font-body">Official communications from the Digital Heroes command center.</p>
      </SlideUp>

      <StaggerContainer className="space-y-4">
        {(!notifications || notifications.length === 0) && (
          <FadeIn className="glass-card p-12 text-center rounded-2xl border border-white/5">
            <p className="text-white/50 font-body">No secure transmissions found.</p>
          </FadeIn>
        )}
        
        {notifications?.map((notif, i) => (
          <StaggerItem key={i} className={`glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border ${!notif.read ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-white/5'}`}>
            <div className="flex gap-4">
              <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notif.read ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              <div>
                <h3 className="font-display text-xl text-white font-bold">{notif.title}</h3>
                <p className="text-white/70 font-body text-sm mt-1">{notif.message}</p>
                <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-3">
                  {new Date(notif.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {notif.action_url && (
              <Link href={notif.action_url}>
                <Button variant="outline" className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10 uppercase tracking-widest font-bold text-[10px]">
                  View Details
                </Button>
              </Link>
            )}
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}
