import { getPublicStats } from '@/lib/public-stats'
import { LandingPageClient } from './LandingPageClient'

export default async function LandingPage() {
  const stats = await getPublicStats()
  return <LandingPageClient stats={stats} />
}
