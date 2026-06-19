"use client"

import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { getAnalyticsData } from "@/app/actions/admin"
import { AnalyticsCharts } from "./AnalyticsCharts"

export default async function AdminReportsPage() {
  const allocations = [
    { title: "Ocean Restoration Delta", sector: "Environmental", amount: "$1,240,000", status: "EXECUTED", color: "emerald" },
    { title: "Digital Literacy 4.0", sector: "Education", amount: "$890,500", status: "PENDING", color: "gold" },
    { title: "Neuro-Health Network", sector: "Healthcare", amount: "$2,100,000", status: "EXECUTED", color: "emerald" }
  ]

  const analyticsData = await getAnalyticsData()

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <SlideUp className="flex justify-between items-end pt-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Impact Analytics</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 inline-flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-emerald-400">LIVE STATUS: OPERATIONAL</span>
          </div>
        </div>
      </SlideUp>

      {/* Metrics Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-emerald-400/40 relative group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 border-x border-b border-white/5 bg-navy-900/60">
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
          </div>
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Total Dispatched</p>
          <h3 className="font-display text-4xl text-emerald-400 font-bold">$4.2M</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>+12.5% vs Prev Quarter</span>
          </div>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-gold-400/40 relative group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 border-x border-b border-white/5 bg-navy-900/60">
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Active Heroes</p>
          <h3 className="font-display text-4xl text-gold-400 font-bold">124,092</h3>
          <div className="mt-4 flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>98% High-Velocity Engagement</span>
          </div>
        </StaggerItem>
        <StaggerItem className="glass-card p-8 rounded-2xl border-t border-emerald-400/40 relative group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 border-x border-b border-white/5 bg-navy-900/60">
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          </div>
          <p className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50 mb-3">Global Reach</p>
          <h3 className="font-display text-4xl text-emerald-400 font-bold">142 Countries</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            <span>4 New Regions Integrated</span>
          </div>
        </StaggerItem>
      </StaggerContainer>

      <AnalyticsCharts userGrowthData={analyticsData.userGrowthData} financialData={analyticsData.financialData} />

      {/* Breakdown Table Section */}
      <FadeIn delay={0.5} className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-navy-900/60">
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <h2 className="font-display text-2xl text-white font-bold">Recent Impact Allocations</h2>
          <Button variant="outline" className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest text-gold-400 border-gold-400/30 hover:bg-gold-400/10 bg-transparent flex items-center gap-2">
            <span>Export Data</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </Button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 font-body text-[10px] text-white/50 font-bold tracking-widest uppercase">
                <th className="px-8 py-6">Initiative</th>
                <th className="px-8 py-6">Sector</th>
                <th className="px-8 py-6">Allocation</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allocations.map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color === 'emerald' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-gold-400/10 border-gold-400/20 text-gold-400'}`}>
                        {item.color === 'emerald' ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-xs text-white/50 mt-1">{item.sector}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-white/70 text-sm font-bold tracking-wide">{item.sector}</td>
                  <td className="px-8 py-6 font-display text-xl text-gold-400 font-bold">{item.amount}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest border uppercase ${item.color === 'emerald' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-gold-400/10 text-gold-400 border-gold-400/20'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all text-white/50 bg-navy-900 opacity-0 group-hover:opacity-100">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
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
