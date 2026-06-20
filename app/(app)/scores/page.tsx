import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import Link from "next/link"
import { getLatestScores } from "@/app/actions/scores"
import { ScoreForm } from "./ScoreForm"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user?.id).single()

  const isActive = profile?.subscription_status === 'active'

  const latestScores = await getLatestScores()

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <SlideUp className="flex flex-col items-center mb-16 text-center pt-8">
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Initialize Performance Log</h1>
        <p className="text-white/70 max-w-lg mx-auto font-body">Securely transmit your current operational metrics to the Hero Core for impact validation.</p>
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Log Form */}
        <section className="lg:col-span-7">
          <FadeIn delay={0.2} className="glass-card shadow-emerald-glow rounded-3xl p-8 md:p-12 relative overflow-hidden border border-emerald-400/20 min-h-[400px] flex flex-col justify-center">
            {/* Subtle Interior Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-400/5 blur-[80px] rounded-full"></div>
            
            {!isActive ? (
              <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-navy-900 border border-gold-400/30 rounded-2xl flex items-center justify-center text-gold-400 mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 className="font-display text-2xl text-white font-bold mb-3">Subscription Required</h3>
                <p className="text-white/60 font-body mb-8 max-w-sm">To submit operational metrics and participate in the draw, you must activate your Legend subscription.</p>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button className="w-full h-12 bg-gold-gradient text-navy-950 font-body uppercase tracking-[0.2em] font-black border-none rounded-xl px-8 shadow-gold-glow">
                    Unlock Access
                  </Button>
                </Link>
              </div>
            ) : (
              <ScoreForm />
            )}
          </FadeIn>
        </section>

        {/* Right Side: Recent Rounds */}
        <section className="lg:col-span-5 space-y-6">
          <FadeIn delay={0.4} className="flex items-center justify-between px-2">
            <h2 className="font-display text-2xl text-white font-bold">Recent Deployments</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          </FadeIn>

          <StaggerContainer className="space-y-4">
            {latestScores.length === 0 && (
              <div className="text-center p-8 text-white/50 font-body">
                No scores deployed yet.
              </div>
            )}
            {latestScores.map((item, i) => (
              <StaggerItem key={i} className="glass-card group rounded-2xl p-5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer border border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:bg-emerald-400/10 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-body text-white font-bold group-hover:text-emerald-400 transition-colors">{item.notes || 'Alpha Sector Log'}</h4>
                    <p className="text-[10px] font-body font-bold uppercase tracking-widest text-white/40 mt-1">{item.date}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="font-display text-2xl font-bold text-gold-400">{item.score}</span>
                    <p className="text-[10px] font-body font-bold uppercase tracking-widest text-gold-400/50">Magnitude</p>
                  </div>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="text-[10px] text-white/50 hover:text-gold-400 font-bold uppercase tracking-widest">Edit</button>
                     <form action={async () => {
                       "use server"; 
                       const { deleteUserScore } = await import('@/app/actions/scores');
                       await deleteUserScore(item.id);
                     }}>
                       <button type="submit" className="text-[10px] text-red-400/70 hover:text-red-400 font-bold uppercase tracking-widest">Delete</button>
                     </form>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.6} className="p-6 bg-gold-400/10 border border-gold-400/20 rounded-2xl flex items-center justify-between mt-6">
            <div>
              <p className="text-[10px] font-body font-bold uppercase tracking-widest text-gold-400 mb-1">Weekly Hero Standing</p>
              <h3 className="font-display text-xl text-white font-bold">Tier II Operative</h3>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-gold-400/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </FadeIn>
        </section>
      </div>
    </div>
  )
}
