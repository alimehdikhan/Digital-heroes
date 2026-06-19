import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { DrawExecuteButton } from "./DrawExecuteButton"
import { DrawCountdown } from "./DrawCountdown"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function AdminDrawsPage() {
  const { data: dbDraws } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  const pastDraws = dbDraws?.map(d => ({
    date: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sequence: d.winning_numbers as number[],
    distributed: `$${d.total_pool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    badge: d.jackpot_rolled_over ? "Rollover Occurred" : "Jackpot Won",
    color: d.jackpot_rolled_over ? "gold" : "emerald"
  })) || []

  return (
    <div className="space-y-12 pb-12">
      {/* Algorithmic Vault Section */}
      <SlideUp className="relative min-h-[500px] flex flex-col items-center justify-center text-center overflow-hidden rounded-[32px] border border-emerald-400/20 mt-8">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-emerald-400/20 opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-emerald-400/20 opacity-20 animate-[pulse_4s_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-400/20 opacity-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]"></div>
        </div>
        
        <div className="relative z-10 space-y-10 max-w-2xl px-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="font-body text-[10px] tracking-widest uppercase font-bold">System Secure - Ready for Execution</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-white font-bold leading-tight">Algorithmic Vault</h2>
            <p className="font-body text-lg text-white/70 max-w-lg mx-auto">Authorize the cryptographically secure distribution of the current jackpot across the global impact network.</p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <DrawExecuteButton />
            <p className="text-[10px] text-white/40 font-body uppercase tracking-widest font-bold">Requires Multi-Sig Level 4 clearance</p>
          </div>
        </div>
      </SlideUp>

      {/* Stats Row */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem className="glass-card p-8 rounded-2xl space-y-2 border border-white/5">
          <span className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50">Current Jackpot</span>
          <div className="font-display text-4xl text-gold-400 font-bold">$1,248,515</div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>+12.4% from last draw</span>
          </div>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl space-y-2 border border-white/5">
          <span className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50">Total Participants</span>
          <div className="font-display text-4xl text-white font-bold">124,092</div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Verified Active Heros</span>
          </div>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl space-y-2 border border-white/5 bg-emerald-400/5">
          <span className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50">Next Draw Countdown</span>
          <DrawCountdown />
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>T-Minus Scheduled Execution</span>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Draw Ledger */}
      <section className="space-y-8 pt-8">
        <FadeIn delay={0.4} className="flex justify-between items-end">
          <div className="space-y-2">
            <h3 className="font-display text-3xl md:text-4xl text-white font-bold">Recent Draw Ledger</h3>
            <p className="text-white/50 font-body text-sm">Immutable historical records of philanthropic distributions.</p>
          </div>
          <span className="text-gold-400 font-body text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:underline border-b border-gold-400/30 pb-1">Export Report</span>
        </FadeIn>
        
        <StaggerContainer className="space-y-4">
          {pastDraws.map((draw, i) => (
            <StaggerItem key={i} className="glass-card p-6 rounded-2xl flex flex-wrap md:flex-nowrap items-center justify-between gap-8 group hover:bg-white/5 transition-colors duration-300 border border-white/5">
              <div className="w-full md:w-48">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Date</span>
                <span className="font-body text-white text-lg">{draw.date}</span>
              </div>
              <div className="w-full md:flex-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-3 text-center md:text-left">Winning Sequence</span>
                <div className="flex gap-3 justify-center md:justify-start">
                  {draw.sequence.map((num, j) => (
                    <div key={j} className="w-10 h-10 rounded-full border border-gold-400/50 flex items-center justify-center font-display text-xl text-gold-400 bg-gold-400/5 font-bold shadow-sm shadow-gold-glow/20">
                      {num.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-64 text-right">
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Total Distributed</span>
                <span className="font-display text-3xl text-white font-bold">{draw.distributed}</span>
              </div>
              <div className="w-full md:w-64">
                <div className={`px-4 py-2 inline-flex items-center gap-2 rounded-lg border ${draw.color === 'emerald' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-gold-400/10 border-gold-400/20 text-gold-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${draw.color === 'emerald' ? 'bg-emerald-400' : 'bg-gold-400'}`}></span>
                  <span className="font-body text-[10px] font-bold uppercase tracking-widest">{draw.badge}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  )
}
