import { getCampaigns } from '@/app/actions/campaigns'
import { CampaignsManager } from './CampaignsManager'
import { SlideUp } from '@/components/ui/motion'

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaigns()

  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c) => c.is_active).length

  return (
    <div className="space-y-8">
      <SlideUp>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h1 className="font-display text-3xl text-gold-400 font-bold mb-1">Campaigns</h1>
          <p className="text-white/50 font-body text-sm">Manage marketing campaigns and link them to draw events.</p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold font-body">Total</p>
              <p className="text-2xl font-display font-bold text-white mt-1">{totalCampaigns}</p>
            </div>
            <div className="bg-emerald-400/10 rounded-xl p-4 border border-emerald-400/20">
              <p className="text-emerald-400/60 text-[10px] uppercase tracking-widest font-bold font-body">Active</p>
              <p className="text-2xl font-display font-bold text-emerald-400 mt-1">{activeCampaigns}</p>
            </div>
          </div>
        </div>
      </SlideUp>

      <CampaignsManager initialCampaigns={campaigns} />
    </div>
  )
}
