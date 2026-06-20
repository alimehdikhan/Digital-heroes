import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProfileForm } from './ProfileForm'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Determine level from subscription
  const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
  const planLabel = profile?.subscription_plan === 'yearly' ? 'Annual Legend' : profile?.subscription_plan === 'monthly' ? 'Monthly Hero' : 'Free Tier'

  // Format renewal date
  const renewalDate = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Status Card */}
      <section className="relative group">
        <SlideUp className="glass-card p-8 md:p-12 rounded-[32px] relative overflow-hidden shadow-emerald-glow border-emerald-400/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gold-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '-2s' }}></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gold-400 to-emerald-400/50 flex items-center justify-center p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-full bg-navy-950 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1 pt-2">
              <p className="font-body text-xs text-emerald-400 uppercase font-bold tracking-widest mb-2">CURRENT STATUS</p>
              <h2 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">{planLabel}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isActive && (
                  <span className="px-4 py-1.5 glass-card border border-emerald-400/30 text-emerald-400 text-[10px] uppercase tracking-widest font-bold rounded-full">Active Subscriber</span>
                )}
                {profile?.subscription_plan === 'yearly' && (
                  <span className="px-4 py-1.5 glass-card border border-gold-400/30 text-gold-400 text-[10px] uppercase tracking-widest font-bold rounded-full">Visionary Donor</span>
                )}
                {!isActive && (
                  <span className="px-4 py-1.5 glass-card border border-white/20 text-white/50 text-[10px] uppercase tracking-widest font-bold rounded-full">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </SlideUp>
      </section>

      {/* Sticky Settings Nav */}
      <nav className="sticky top-20 z-40 -mx-4 md:mx-0 px-4 md:px-0 py-4 bg-navy-950/90 backdrop-blur-md border-b border-white/5 overflow-x-auto flex items-center gap-8 no-scrollbar">
        <a className="text-gold-400 font-bold whitespace-nowrap transition-all border-b-2 border-gold-400 pb-2 font-body text-sm uppercase tracking-widest" href="#account">Account</a>
        <a className="text-white/50 hover:text-gold-400 whitespace-nowrap transition-all pb-2 font-body text-sm uppercase tracking-widest" href="#subscription">Subscription</a>
        <a className="text-white/50 hover:text-gold-400 whitespace-nowrap transition-all pb-2 font-body text-sm uppercase tracking-widest" href="/notifications">Notifications</a>
        <a className="text-white/50 hover:text-gold-400 whitespace-nowrap transition-all pb-2 font-body text-sm uppercase tracking-widest" href="#security">Security</a>
      </nav>

      {/* Personal Details Form */}
      <section id="account" className="space-y-8 pt-4 scroll-mt-32">
        <FadeIn delay={0.2} className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <h3 className="font-display text-3xl text-white font-bold">Personal Details</h3>
        </FadeIn>
        
        <ProfileForm
          defaultName={profile?.name || ''}
          email={user.email || ''}
        />
      </section>

      {/* Subscription Management Card */}
      <section id="subscription" className="space-y-8 pt-8 scroll-mt-32">
        <FadeIn delay={0.4} className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          <h3 className="font-display text-3xl text-white font-bold">Subscription</h3>
        </FadeIn>
        
        <FadeIn delay={0.5}>
          <div className="glass-card p-8 md:p-10 rounded-[32px] border border-gold-400/30 bg-gradient-to-br from-gold-400/5 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,_rgba(242,202,80,0.15)_0%,_transparent_50%)]"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div>
                <h4 className="font-display text-3xl text-gold-400 font-bold mb-2">{planLabel}</h4>
                <p className="text-white/70 font-body">
                  {profile?.subscription_plan === 'yearly' ? '₹19,999 / Year' : profile?.subscription_plan === 'monthly' ? '₹1,999 / Month' : 'No active plan'}
                  {renewalDate && ` • Renewal: ${renewalDate}`}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {isActive ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span className="text-emerald-400 text-xs uppercase tracking-widest font-bold">Subscription Active</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span className="text-white/40 text-xs uppercase tracking-widest font-bold">{profile?.subscription_status === 'cancelled' ? 'Cancelled' : profile?.subscription_status === 'past_due' ? 'Payment Past Due' : 'Inactive'}</span>
                    </>
                  )}
                </div>
              </div>
              
              <Link href="/pricing" className="w-full md:w-auto inline-flex items-center justify-center px-8 h-14 btn-primary rounded-xl text-navy-950 font-body uppercase tracking-widest font-black shrink-0">
                {isActive ? 'Manage Plan' : 'Subscribe Now'}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Destructive Action */}
      <section id="security" className="scroll-mt-32">
        <FadeIn delay={0.6} className="pt-12 border-t border-white/5">
          <button className="flex items-center gap-3 text-red-400/60 hover:text-red-400 transition-colors font-body text-xs uppercase tracking-widest font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Deactivate Digital Identity
          </button>
        </FadeIn>
      </section>
    </div>
  )
}
