import { SlideUp, FadeIn } from "@/components/ui/motion"
import { getOrganizations } from "@/app/actions/orgs"
import { OrgManager } from "./OrgManager"

export default async function AdminOrganizationsPage() {
  const orgs = await getOrganizations()

  return (
    <div className="space-y-8 pb-12">
      <SlideUp className="pt-8">
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Organizations</h1>
        <p className="text-white/70 font-body text-lg max-w-xl">Manage team and corporate accounts within the Digital Heroes ecosystem.</p>
      </SlideUp>

      <FadeIn>
        <OrgManager initialOrgs={orgs} />
      </FadeIn>
    </div>
  )
}
