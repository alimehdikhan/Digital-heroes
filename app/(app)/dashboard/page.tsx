export const dynamic = 'force-dynamic'
export const revalidate = 0
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getLatestScores } from "@/app/actions/scores"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { EditCharity } from "./EditCharity"
import { ScoreManager } from "./ScoreManager"
import { WinnerProofUpload } from "./WinnerProofUpload"
import { isSubscriptionActive } from "@/lib/utils/subscription"

export default async function DashboardPage() {
  const latestScores = await getLatestScores()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real data
  const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_plan, subscription_expires_at, supported_charity_id, charity_percentage, created_at').eq('id', user?.id).single()
  const { data: charities } = await supabaseAdmin.from('charities').select('id, name').eq('is_active', true)
  
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Current jackpot: look for the latest rollover or default to 0
  const { data: latestDraw } = await supabaseAdmin
    .from('draws')
    .select('jackpot_amount, jackpot_rolled_over, rollover_amount, total_pool, month, year')
    .eq('status', 'completed')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .single()

  const currentJackpot = latestDraw?.jackpot_rolled_over 
    ? (latestDraw.rollover_amount || latestDraw.jackpot_amount || 0)
    : 0

  // User winnings & participated draws & proofs
  const { data: userWinnings } = await supabaseAdmin
    .from('draw_winners')
    .select(`
      id,
      amount, 
      payout_status, 
      tier, 
      draws(month, year),
      winner_proofs(status)
    `)
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })

  const totalWinnings = userWinnings?.reduce((sum, w) => sum + Number(w.amount || 0), 0) || 0

  // Draw countdown: days until end of current month
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const diffMs = endOfMonth.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  const hoursLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))

  // Draws entered: completed draws where user had 5+ scores in that month
  const { data: completedDraws } = await supabaseAdmin
    .from('draws')
    .select('month, year')
    .eq('status', 'completed')

  const { data: userScoreDates } = await supabase
    .from('scores')
    .select('date')
    .eq('user_id', user?.id || '')

  let drawsEntered = 0
  for (const draw of completedDraws || []) {
    const countInMonth =
      userScoreDates?.filter((s) => {
        const d = new Date(s.date)
        return d.getMonth() + 1 === draw.month && d.getFullYear() === draw.year
      }).length || 0
    if (countInMonth >= 5) drawsEntered++
  }

  const upcomingDrawDate = endOfMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const minsLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)))

  const isActive = isSubscriptionActive(profile)
  const heroLabel = isActive 
    ? (profile?.subscription_plan === 'yearly' ? 'LEGEND' : 'HERO') 
    : 'INACTIVE'

  return (
    <div className="space-y-12">
      {/* Next Draw Countdown */}
      <section className="flex flex-col items-center justify-center text-center">
        <SlideUp className="glass-card shadow-gold-glow rounded-[32px] p-8 md:p-12 w-full max-w-3xl border-gold-400/20 group">
          <h2 className="font-body text-xs text-gold-400 font-bold tracking-[0.2em] mb-6 uppercase">NEXT DRAW COUNTDOWN</h2>
          <div className="flex justify-center gap-4 md:gap-8 items-center mb-8">
            <div className="flex flex-col items-center">
              <span className="font-display text-4xl md:text-7xl text-white font-bold drop-shadow-lg">{String(daysLeft).padStart(2, '0')}</span>
              <span className="font-body text-[10px] text-white/50 font-bold tracking-widest mt-2 uppercase">DAYS</span>
            </div>
            <span className="font-display text-4xl md:text-7xl text-gold-400/30 mb-6">:</span>
            <div className="flex flex-col items-center">
              <span className="font-display text-4xl md:text-7xl text-white font-bold drop-shadow-lg">{String(hoursLeft).padStart(2, '0')}</span>
              <span className="font-body text-[10px] text-white/50 font-bold tracking-widest mt-2 uppercase">HOURS</span>
            </div>
            <span className="font-display text-4xl md:text-7xl text-gold-400/30 mb-6">:</span>
            <div className="flex flex-col items-center">
              <span className="font-display text-4xl md:text-7xl text-white font-bold drop-shadow-lg">{String(minsLeft).padStart(2, '0')}</span>
              <span className="font-body text-[10px] text-white/50 font-bold tracking-widest mt-2 uppercase">MINS</span>
            </div>
          </div>
          <Link href="/scores">
            <Button size="lg" className="btn-primary w-full md:w-auto h-14 px-12 text-sm uppercase tracking-widest font-black shadow-lg hover:shadow-xl">
              Secure Your Entry
            </Button>
          </Link>
        </SlideUp>
      </section>

      {/* Jackpot Display & Profile Stats */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StaggerItem className="glass-card rounded-[24px] p-8 flex flex-col justify-center items-center text-center min-h-[240px] border-emerald-400/20">
          <h3 className="font-body text-xs text-white/50 font-bold uppercase tracking-[0.2em] mb-2">CURRENT JACKPOT</h3>
          <div className="relative">
            <span className="font-display text-4xl md:text-6xl text-emerald-400 font-bold tracking-tight block drop-shadow-md">
              ₹{currentJackpot.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <div className="absolute -inset-2 bg-emerald-400/10 blur-xl rounded-full -z-10"></div>
          </div>
          <p className="font-body text-white/40 mt-4 text-sm italic">
            {currentJackpot > 0 ? 'Rolled over from previous draw' : 'Pool builds from subscriptions'}
          </p>
        </StaggerItem>

        <StaggerItem className="glass-card rounded-[24px] p-8 flex flex-col justify-between border-gold-400/20">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-display text-2xl text-white font-bold">Hero Status</h4>
              <p className="text-gold-400 font-body text-xs font-bold uppercase tracking-widest mt-1">{heroLabel}</p>
            </div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70 font-body">Total Winnings</span>
              <span className="text-white font-bold font-display text-lg">₹{totalWinnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70 font-body">Draws Entered</span>
              <span className="text-white font-bold font-display text-lg">{drawsEntered}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70 font-body">Active Scores</span>
              <span className="text-white font-bold font-display text-lg">{latestScores.length} / 5</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4 mt-4">
              <span className="text-white/70 font-body">Subscription</span>
              <span className={`font-bold font-body text-xs uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>{profile?.subscription_status || 'inactive'}</span>
            </div>
            {profile?.subscription_expires_at && (
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                <span className="text-white/50">Renewal Date</span>
                <span className="text-white">{new Date(profile.subscription_expires_at).toLocaleDateString()}</span>
              </div>
            )}
            <div className="pt-4 border-t border-white/10 mt-4">
              <span className="text-white/70 font-body text-sm block mb-2">Upcoming Draw</span>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold font-display">{upcomingDrawDate}</span>
                {isActive && latestScores.length >= 5 ? (
                  <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 rounded">Qualified</span>
                ) : (
                  <span className="text-gold-400 text-[10px] uppercase font-bold tracking-widest border border-gold-400/30 bg-gold-400/10 px-2 py-1 rounded">Needs {Math.max(0, 5 - latestScores.length)} Scores</span>
                )}
              </div>
            </div>
            {profile && <EditCharity charities={charities || []} currentId={profile.supported_charity_id} currentPct={profile.charity_percentage || 10} />}
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Prize Pool Breakdown */}
      <section className="space-y-6 pt-6">
        <FadeIn>
          <h2 className="font-display text-3xl text-white font-bold">Prize Pool Structure</h2>
          <p className="text-white/60 font-body text-sm mt-2">How the monthly algorithmic draw distributes the rewards.</p>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StaggerItem className="glass-card rounded-[24px] p-6 border-emerald-400/20 text-center relative overflow-hidden group hover:border-emerald-400/40 transition-colors">
            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="font-body text-xs text-white/50 font-bold uppercase tracking-[0.2em] mb-4">5-Number Match</h4>
            <div className="font-display text-4xl text-emerald-400 font-bold mb-2">40%</div>
            <p className="text-white/80 font-body text-sm font-medium">The Ultimate Jackpot</p>
            <p className="text-white/40 font-body text-xs mt-2 italic">Rolls over to next month if unclaimed</p>
          </StaggerItem>
          <StaggerItem className="glass-card rounded-[24px] p-6 border-gold-400/20 text-center relative overflow-hidden group hover:border-gold-400/40 transition-colors">
            <div className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="font-body text-xs text-white/50 font-bold uppercase tracking-[0.2em] mb-4">4-Number Match</h4>
            <div className="font-display text-4xl text-gold-400 font-bold mb-2">35%</div>
            <p className="text-white/80 font-body text-sm font-medium">Legend Tier</p>
            <p className="text-white/40 font-body text-xs mt-2 italic">Distributed evenly among winners</p>
          </StaggerItem>
          <StaggerItem className="glass-card rounded-[24px] p-6 border-white/10 text-center relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="font-body text-xs text-white/50 font-bold uppercase tracking-[0.2em] mb-4">3-Number Match</h4>
            <div className="font-display text-4xl text-white font-bold mb-2">25%</div>
            <p className="text-white/80 font-body text-sm font-medium">Hero Tier</p>
            <p className="text-white/40 font-body text-xs mt-2 italic">Distributed evenly among winners</p>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Recent Activity: Stableford Scores */}
      <section className="space-y-6 pt-6">
        <FadeIn className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-white font-bold">Recent Scores</h2>
          <Link href="/scores" className="text-gold-400 font-body text-xs font-bold uppercase tracking-widest hover:underline decoration-gold-400/30 underline-offset-4">
            View All Scores
          </Link>
        </FadeIn>
        
        <StaggerContainer>
          <ScoreManager initialScores={latestScores} />
        </StaggerContainer>
      </section>

      {/* Winnings Overview */}
      <section className="space-y-6 pt-6">
        <FadeIn>
          <h2 className="font-display text-3xl text-white font-bold">Winnings Ledger</h2>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userWinnings?.length === 0 && (
            <div className="md:col-span-2 text-center p-8 text-white/50 font-body glass-card rounded-xl">
              No winnings yet. Your time will come, Hero.
            </div>
          )}
          {userWinnings?.map((win, i) => (
            <div key={win.id} className="space-y-4">
              <StaggerItem className="glass-card rounded-xl p-5 flex items-center justify-between border border-white/5">
                <div>
                  <p className="font-display text-xl text-white font-bold">₹{Number(win.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-white/40 font-body font-bold uppercase tracking-widest mt-1">
                    {(win.draws as any)?.month}/{(win.draws as any)?.year} • {win.tier}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${win.payout_status === 'paid' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-gold-400/10 text-gold-400 border-gold-400/30'}`}>
                  {win.payout_status || 'PENDING'}
                </div>
              </StaggerItem>
              
              {/* Show proof upload if pending and no pending proof exists */}
              {win.payout_status === 'pending' && (!win.winner_proofs || win.winner_proofs.length === 0 || win.winner_proofs[0].status === 'rejected') && (
                <StaggerItem>
                  <WinnerProofUpload 
                    winnerId={win.id} 
                    drawMonth={(win.draws as any)?.month || ''} 
                    drawYear={(win.draws as any)?.year || new Date().getFullYear()} 
                  />
                </StaggerItem>
              )}
              {/* Show pending status if proof is uploaded and pending review */}
              {win.payout_status === 'pending' && win.winner_proofs?.[0]?.status === 'pending' && (
                <StaggerItem className="p-4 bg-emerald-400/10 border border-emerald-400/30 rounded-xl flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <div>
                    <p className="text-emerald-400 font-bold font-display">Proof Under Review</p>
                    <p className="text-emerald-400/70 text-xs font-body mt-1">Our team is verifying your golf score.</p>
                  </div>
                </StaggerItem>
              )}
              {/* Show approved status if proof is verified but payout is pending */}
              {win.payout_status === 'pending' && win.winner_proofs?.[0]?.status === 'approved' && (
                <StaggerItem className="p-4 bg-gold-400/10 border border-gold-400/30 rounded-xl flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
                  <div>
                    <p className="text-gold-400 font-bold font-display">Proof Verified</p>
                    <p className="text-gold-400/70 text-xs font-body mt-1">Your payout is currently being processed.</p>
                  </div>
                </StaggerItem>
              )}
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* Notifications Section */}
      {notifications && notifications.length > 0 && (
        <section className="space-y-6 pt-6">
          <FadeIn>
            <h2 className="font-display text-3xl text-white font-bold">Secure Transmissions</h2>
          </FadeIn>
          <StaggerContainer className="space-y-4">
            {notifications.map((notif, i) => (
              <StaggerItem key={i} className={`glass-card rounded-xl p-5 border ${notif.read ? 'border-white/5 bg-navy-900/30' : 'border-emerald-400/30 bg-emerald-400/5 shadow-emerald-glow'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-display text-lg text-white font-bold">{notif.title}</h4>
                    <p className="text-sm text-white/70 font-body mt-1">{notif.message}</p>
                  </div>
                  {notif.action_url && (
                    <Link href={notif.action_url}>
                      <Button size="sm" className="btn-primary text-[10px] uppercase tracking-widest font-bold h-8">Action Required</Button>
                    </Link>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* Mission Impact Card */}
      <FadeIn delay={0.4} className="glass-card rounded-2xl p-8 md:p-12 overflow-hidden relative min-h-[300px] flex flex-col justify-center border border-emerald-400/20 group">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 h-full w-full md:w-2/3 z-0 opacity-40 mix-blend-screen bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPoODlO6wnZv1-DSil59Z9xlZv5qMvFRk26N9cU50MGVJ9IfzKl-kXDGvmPAO5fY4iheRwUJwtigtBbNoue5anhlfQMGVesXfVSysT16s-d-7DFcRWdelknkewxbz2GEuD7XcvFkX7M8j8a7dj2smhQw7NLtGzXadZUqkIJjoHuGNIZy5sF2xRTPYpcxOwEYQeQ_GAZQqd_uULxMb7-Xay2W2MfXul97sdraIkNPJRkv1EQnjJT-TX8Yo0HV5wAjYDncwNtvN4cA')" }}></div>
        
        <div className="relative z-20 md:w-2/3">
          <h2 className="font-display text-3xl md:text-5xl text-emerald-400 font-bold mb-4 leading-tight">Your Play Fuels Global Progress</h2>
          <p className="text-white/70 font-body text-lg mb-8 max-w-lg">Every score registered contributes to our collective mission. This month, we're supporting clean water initiatives across 12 countries.</p>
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-1.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 text-[10px] font-body font-bold uppercase tracking-widest backdrop-blur-md">ENVIRONMENTAL IMPACT</span>
            <span className="px-4 py-1.5 rounded-full bg-gold-400/10 text-gold-400 border border-gold-400/30 text-[10px] font-body font-bold uppercase tracking-widest backdrop-blur-md">GLOBAL REACH</span>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
