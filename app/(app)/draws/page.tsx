import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch latest completed draw
  const { data: latestDraw } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('status', 'completed')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .single()

  const drawSequence = latestDraw?.winning_numbers || [0, 0, 0, 0, 0]

  // Fetch user's scores to check matches
  let userScores: number[] = []
  let userMatches: number[] = []
  let userNonMatches: number[] = []

  if (user) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)
    
    userScores = scores?.map(s => s.score) || []
    const winSet = new Set(drawSequence)
    userMatches = userScores.filter(s => winSet.has(s))
    userNonMatches = userScores.filter(s => !winSet.has(s))
  }

  // Fetch user's wins for this draw
  let userWin = null
  if (user && latestDraw) {
    const { data: win } = await supabaseAdmin
      .from('draw_winners')
      .select('*')
      .eq('draw_id', latestDraw.id)
      .eq('user_id', user.id)
      .single()
    userWin = win
  }

  const hasData = latestDraw !== null
  const matchCount = userMatches.length

  return (
    <div className="space-y-16 pb-16">
      {/* Hero: The Reveal */}
      <section className="relative z-10 text-center mb-16 pt-12">
        <SlideUp>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-4 italic font-bold">The Reveal</h1>
          {hasData && (
            <p className="font-body text-white/50 text-sm uppercase tracking-widest">
              {new Date(0, (latestDraw.month || 1) - 1).toLocaleString('default', { month: 'long' })} {latestDraw.year} Draw
            </p>
          )}
        </SlideUp>

        <div className="relative w-full max-w-4xl mx-auto h-64 md:h-80 flex items-center justify-center mt-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold-400/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          
          {hasData ? (
            <StaggerContainer className="flex justify-center gap-4 md:gap-8 lg:gap-12 w-full">
              {drawSequence.map((num: number, i: number) => (
                <StaggerItem key={i} className="relative group">
                  <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-full glass-card border-2 border-gold-400/40 shadow-gold-glow relative overflow-hidden transition-transform duration-700 hover:scale-110">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-400/30 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-60"></div>
                    <span className="font-display text-2xl md:text-4xl lg:text-5xl text-gold-400 font-bold relative z-10 drop-shadow-md">{String(num).padStart(2, '0')}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center">
              <p className="font-body text-white/50 text-lg">No draws have been executed yet.</p>
              <p className="font-body text-white/30 text-sm mt-2">The first draw will appear here once an admin runs it.</p>
            </div>
          )}
        </div>
      </section>

      {/* User Performance */}
      {userScores.length > 0 && hasData && (
        <section className="relative z-10">
          <SlideUp className="glass-card rounded-[32px] p-8 md:p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute -left-24 -top-24 w-64 h-64 bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
              <div className="text-left">
                <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-3">Your Performance</h2>
                <p className="font-body text-white/70 max-w-xl text-lg">Your scores compared against the winning numbers.</p>
              </div>
              <div className={`px-6 py-3 rounded-full border ${matchCount >= 3 ? 'bg-emerald-400/10 border-emerald-400/30 shadow-emerald-glow' : 'bg-white/5 border-white/10'}`}>
                <span className={`font-body text-xs tracking-widest uppercase font-black ${matchCount >= 3 ? 'text-emerald-400' : 'text-white/50'}`}>
                  {matchCount} Match{matchCount !== 1 ? 'es' : ''}
                  {matchCount >= 5 && ' — JACKPOT!'}
                  {matchCount === 4 && ' — Silver Tier'}
                  {matchCount === 3 && ' — Bronze Tier'}
                </span>
              </div>
            </div>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 relative z-10">
              {userScores.map((score, i) => {
                const isMatch = drawSequence.includes(score)
                return (
                  <StaggerItem key={i}>
                    <div className={`glass-card rounded-2xl p-6 md:p-8 text-center transition-transform hover:scale-105 border ${isMatch ? 'border-emerald-400/50 shadow-emerald-glow bg-emerald-400/5' : 'border-white/5 opacity-50 grayscale'}`}>
                      <span className={`block font-body text-[10px] mb-2 uppercase font-bold tracking-widest ${isMatch ? 'text-emerald-400' : 'text-white/40'}`}>
                        {isMatch ? 'Match' : 'No Match'}
                      </span>
                      <span className={`font-display text-4xl md:text-5xl font-bold ${isMatch ? 'text-emerald-400' : 'text-white/50'}`}>
                        {String(score).padStart(2, '0')}
                      </span>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>

            {userWin && (
              <div className="mt-8 p-6 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-center">
                <p className="font-body text-xs text-gold-400 font-bold uppercase tracking-widest mb-2">You Won!</p>
                <p className="font-display text-3xl text-gold-400 font-bold">₹{Number(userWin.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                {userWin.payout_status === 'pending' && (
                  <Link href={`/proofs/${userWin.id}`} className="mt-4 inline-block">
                    <Button className="btn-primary px-8 h-10 uppercase tracking-widest font-bold text-xs">Submit Proof</Button>
                  </Link>
                )}
              </div>
            )}
          </SlideUp>
        </section>
      )}

      {/* Prize Tiers */}
      <section className="relative z-10">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StaggerItem className="glass-card p-8 md:p-10 rounded-[32px] border border-gold-400/40 relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl group-hover:bg-gold-400/20 transition-all"></div>
            <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mb-8 border border-gold-400/20 text-gold-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <h3 className="font-display text-2xl text-white font-bold mb-2">Jackpot</h3>
            <p className="font-body text-xs text-gold-400 mb-2 font-bold tracking-[0.2em] uppercase">5 Matches — 40% of Pool</p>
            {hasData && <p className="font-display text-2xl text-gold-400/70">₹{Number(latestDraw.jackpot_amount || 0).toLocaleString()}</p>}
          </StaggerItem>

          <StaggerItem className="glass-card p-8 md:p-10 rounded-[32px] border border-white/10 relative group hover:bg-white/5 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-slate-400/10 flex items-center justify-center mb-8 border border-slate-400/20 text-slate-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="font-display text-2xl text-white font-bold mb-2">Silver Tier</h3>
            <p className="font-body text-xs text-slate-400 mb-2 font-bold tracking-[0.2em] uppercase">4 Matches — 35% of Pool</p>
            {hasData && <p className="font-display text-2xl text-slate-400/70">₹{Number(latestDraw.prize_4match || 0).toLocaleString()}</p>}
          </StaggerItem>

          <StaggerItem className="glass-card p-8 md:p-10 rounded-[32px] border border-white/5 relative group hover:bg-white/5 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-[#cd7f32]/10 flex items-center justify-center mb-8 border border-[#cd7f32]/20 text-[#cd7f32]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
            </div>
            <h3 className="font-display text-2xl text-white font-bold mb-2">Bronze Tier</h3>
            <p className="font-body text-xs text-[#cd7f32] mb-2 font-bold tracking-[0.2em] uppercase">3 Matches — 25% of Pool</p>
            {hasData && <p className="font-display text-2xl text-[#cd7f32]/70">₹{Number(latestDraw.prize_3match || 0).toLocaleString()}</p>}
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* CTA */}
      <ScaleIn delay={0.4} className="flex flex-col md:flex-row justify-center items-center gap-6 pt-8">
        <Link href="/scores">
          <Button size="lg" className="w-full md:w-auto h-16 px-12 btn-primary rounded-full uppercase tracking-[0.2em] font-black shadow-2xl hover:shadow-gold-glow border-none">
            Log Your Scores
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="w-full md:w-auto h-16 px-12 border-gold-400/40 text-gold-400 hover:bg-gold-400/10 rounded-full uppercase tracking-[0.2em] font-black bg-transparent">
            Return to Arena
          </Button>
        </Link>
      </ScaleIn>
    </div>
  )
}
