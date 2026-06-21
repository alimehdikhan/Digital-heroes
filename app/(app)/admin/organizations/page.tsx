import { getOrganizations } from '@/app/actions/organizations'
import { OrganizationsManager } from './OrganizationsManager'
import { SlideUp } from '@/components/ui/motion'

export default async function AdminOrganizationsPage() {
  const organizations = await getOrganizations()

  const totalOrgs = organizations.length

  return (
    <div className="space-y-8">
      <SlideUp>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h1 className="font-display text-3xl text-gold-400 font-bold mb-1">Teams &amp; Organizations</h1>
          <p className="text-white/50 font-body text-sm">Manage corporate and team accounts for the platform.</p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold font-body">Total Teams</p>
              <p className="text-2xl font-display font-bold text-white mt-1">{totalOrgs}</p>
            </div>
          </div>
        </div>
      </SlideUp>

      <OrganizationsManager initialOrganizations={organizations} />
    </div>
  )
}
