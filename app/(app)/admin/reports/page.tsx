import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { getAnalyticsData } from "@/app/actions/admin"
import { AnalyticsCharts } from "./AnalyticsCharts"

export default async function AdminReportsPage() {
  const analyticsData = await getAnalyticsData()

  return (
    <div className="space-y-12 pb-12">
      <SlideUp className="flex justify-between items-end pt-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Impact Analytics</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 inline-flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-emerald-400">LIVE DATA</span>
          </div>
        </div>
      </SlideUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-emerald-400/40 border-x border-b border-white/5 bg-navy-900/60">
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Total Users</p>
          <h3 className="font-display text-4xl text-emerald-400 font-bold">{analyticsData.summary.totalUsers.toLocaleString()}</h3>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-gold-400/40 border-x border-b border-white/5 bg-navy-900/60">
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Active Subscribers</p>
          <h3 className="font-display text-4xl text-gold-400 font-bold">{analyticsData.summary.activeSubs.toLocaleString()}</h3>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-emerald-400/40 border-x border-b border-white/5 bg-navy-900/60">
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Charity Dispatched</p>
          <h3 className="font-display text-4xl text-emerald-400 font-bold">₹{analyticsData.summary.totalCharity.toLocaleString()}</h3>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem className="glass-card p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Total Prize Pool (all draws)</p>
          <p className="font-display text-3xl text-gold-400 font-bold">₹{analyticsData.summary.totalPool.toLocaleString()}</p>
        </StaggerItem>
        <StaggerItem className="glass-card p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Completed Draws</p>
          <p className="font-display text-3xl text-white font-bold">{analyticsData.drawStats.totalDraws}</p>
        </StaggerItem>
        <StaggerItem className="glass-card p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Jackpot Rollovers</p>
          <p className="font-display text-3xl text-white font-bold">{analyticsData.drawStats.rollovers}</p>
        </StaggerItem>
      </StaggerContainer>

      <AnalyticsCharts userGrowthData={analyticsData.userGrowthData} financialData={analyticsData.financialData} />

      <FadeIn delay={0.5} className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-navy-900/60">
        <div className="p-8 border-b border-white/10">
          <h2 className="font-display text-2xl text-white font-bold">Charity Contribution Totals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 font-body text-[10px] text-white/50 font-bold tracking-widest uppercase">
                <th className="px-8 py-6">Charity</th>
                <th className="px-8 py-6">Total Contributed</th>
                <th className="px-8 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analyticsData.charities.map((charity) => (
                <tr key={charity.id} className="hover:bg-white/[0.02]">
                  <td className="px-8 py-6 font-bold text-white">{charity.name}</td>
                  <td className="px-8 py-6 font-display text-xl text-gold-400 font-bold">₹{Number(charity.total_contributed || 0).toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${charity.is_active ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-white/50 border-white/20'}`}>
                      {charity.is_active ? 'Featured' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  )
}
