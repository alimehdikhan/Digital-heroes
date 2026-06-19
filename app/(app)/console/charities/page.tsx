import { SlideUp } from "@/components/ui/motion"
import { getCharities } from "@/app/actions/admin"
import { CharityManager } from "./CharityManager"

export default async function AdminCharitiesPage() {
  const charities = await getCharities()

  // Calculate totals for the header
  const totalDispatched = charities.reduce((sum, c) => sum + Number(c.total_contributed), 0)
  const activeProjectsCount = charities.filter(c => c.is_active).length

  return (
    <div className="space-y-12 pb-12">
      {/* Hero: Charity Overview */}
      <SlideUp className="pt-8">
        <div className="glass-card p-8 md:p-12 rounded-[32px] relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 blur-[100px] -z-10 rounded-full animate-pulse"></div>
          <h2 className="font-body text-xs text-white/50 uppercase font-bold tracking-widest mb-8">Dispatch Center</h2>
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-2">
              <p className="text-white/70 font-body uppercase tracking-widest font-bold text-[10px]">Total Dispatched</p>
              <p className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-400 font-bold">${totalDispatched.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/70 font-body uppercase tracking-widest font-bold text-[10px]">Active Projects</p>
              <p className="font-display text-4xl md:text-5xl lg:text-6xl text-emerald-400 font-bold">{activeProjectsCount}</p>
            </div>
          </div>
        </div>
      </SlideUp>

      <CharityManager initialCharities={charities} />
    </div>
  )
}
