import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { ReviewProofButtons } from "./ReviewProofButtons"
import { MarkPaidButton } from "./MarkPaidButton"

export default async function AdminDashboardPage() {
  console.log("================ ADMIN PAGE RENDERED ================")
  // Fetch pending proofs
  const { data: pendingProofs } = await supabaseAdmin
    .from('winner_proofs')
    .select('*, profiles!winner_proofs_user_id_fkey(name, subscription_status), draws(total_pool, jackpot_amount), draw_winners(amount, tier)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Fetch full winners list
  const { data: allWinners } = await supabaseAdmin
    .from('draw_winners')
    .select('*, profiles(name), draws(month, year)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-12 pb-12">
      {/* Dashboard Header */}
      <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Command Center</h1>
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </div>
            <span className="font-body text-xs font-bold tracking-widest text-emerald-400 uppercase">System Status: Operational</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/admin/charities" className="flex items-center justify-center px-8 h-12 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 font-body uppercase tracking-widest font-black rounded-lg transition-all">
            Manage Charities
          </a>
          <Button className="px-8 h-12 btn-primary font-body uppercase tracking-widest font-black shadow-emerald-glow border-none bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-navy-950">
            Initialize Draw
          </Button>
        </div>
      </SlideUp>

      {/* Metric Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: "payments", trend: "+12.5%", label: "Total Revenue", value: "$4,281,902", color: "gold" },
          { icon: "person_celebrate", trend: "+842", label: "Active Heroes", value: "124,092", color: "emerald" },
          { icon: "military_tech", trend: "Current Pool", label: "Jackpot Size", value: "$850,000", color: "gold" },
          { icon: "eco", trend: "Distributed", label: "Charity Pool", value: "$1.2M", color: "emerald" }
        ].map((metric, i) => (
          <StaggerItem key={i} className={`glass-card p-8 rounded-2xl group hover:bg-white/5 transition-all duration-500 border border-white/5 ${metric.color === 'gold' ? 'hover:shadow-gold-glow hover:border-gold-400/30' : 'hover:shadow-emerald-glow hover:border-emerald-400/30'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`text-${metric.color}-400`}>
                {metric.icon === "payments" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>}
                {metric.icon === "person_celebrate" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 3.13 19 6 22 3.13"/><polyline points="16 8.13 19 11 22 8.13"/></svg>}
                {metric.icon === "military_tech" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>}
                {metric.icon === "eco" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
              </div>
              <span className={`text-xs font-bold ${metric.color === 'gold' ? 'text-gold-400' : 'text-emerald-400'}`}>{metric.trend}</span>
            </div>
            <p className="font-body text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-2">{metric.label}</p>
            <p className={`font-display text-4xl font-bold ${metric.color === 'gold' ? 'text-gold-400' : 'text-emerald-400'}`}>{metric.value}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity Log: Winner Approvals (2/3 width) */}
        <FadeIn delay={0.4} className="xl:col-span-2 glass-card rounded-2xl overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 border border-gold-400/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h2 className="font-display text-2xl text-white font-bold">Winner Approvals Needed</h2>
            </div>
            <span className="px-4 py-1.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/30">3 Urgent</span>
          </div>

          <div className="divide-y divide-white/5">
            {pendingProofs?.length === 0 && (
              <div className="p-8 text-center text-white/50 font-body text-sm">
                No pending winner approvals.
              </div>
            )}
            {pendingProofs?.map((proof, i) => (
              <div key={i} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center border border-white/10 text-white/50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-bold">User: {proof.profiles?.name}</p>
                    <p className="text-xs text-white/50 mt-1 uppercase">Tier: {proof.draw_winners?.tier}</p>
                    <a href={proof.proof_url} target="_blank" rel="noreferrer" className="text-emerald-400 text-xs hover:underline mt-1 block">View Proof File</a>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-gold-400 font-display text-2xl font-bold">${Number(proof.draw_winners?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1">Payout Amount</p>
                </div>
                <ReviewProofButtons proofId={proof.id} />
              </div>
            ))}
          </div>


        </FadeIn>

        {/* Full Winners List */}
        <FadeIn delay={0.5} className="xl:col-span-2 glass-card rounded-2xl overflow-hidden border border-white/5 mt-6">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display text-2xl text-white font-bold">All Winners (Last 50)</h2>
          </div>
          <div className="divide-y divide-white/5 overflow-x-auto">
            <table className="w-full text-left font-body text-sm text-white/70">
              <thead className="bg-navy-900/50 text-[10px] uppercase tracking-widest text-white/50">
                <tr>
                  <th className="p-4">Winner</th>
                  <th className="p-4">Draw</th>
                  <th className="p-4">Tier (Matches)</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {allWinners?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/50">No winners found.</td>
                  </tr>
                )}
                {allWinners?.map((winner, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{winner.profiles?.name}</td>
                    <td className="p-4">{winner.draws?.month}/{winner.draws?.year}</td>
                    <td className="p-4 uppercase">{winner.tier} ({winner.match_count})</td>
                    <td className="p-4 text-gold-400 font-bold">${Number(winner.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 uppercase text-[10px] font-bold tracking-widest text-emerald-400">
                      <div className="flex items-center gap-2">
                        {winner.payout_status || 'PENDING'}
                        {winner.payout_status !== 'paid' && <MarkPaidButton winnerId={winner.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Secondary Panel: Distribution Stats */}
        <FadeIn delay={0.6} className="glass-card rounded-2xl p-8 flex flex-col border border-white/5">
          <h2 className="font-display text-2xl text-white font-bold mb-8">Charity Alpha</h2>
          <div className="space-y-8 flex-1">
            {[
              { label: "Ocean Recovery Fund", progress: 72 },
              { label: "Tech for Education", progress: 45 },
              { label: "Reforestation Init.", progress: 89 }
            ].map((charity, i) => (
              <div key={i}>
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{charity.label}</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{charity.progress}% Goal</span>
                </div>
                <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full" style={{ width: `${charity.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-2xl bg-gold-400/5 border border-gold-400/20 text-center">
            <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em] mb-2">Next Impact Cycle</p>
            <p className="font-display text-3xl font-bold text-white tracking-widest">04:12:35:12</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
