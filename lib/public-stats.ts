import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPlanPrice } from '@/lib/pricing'

export type PublicStats = {
  currentJackpot: number
  daysUntilDraw: number
  activeHeroes: number
  totalPaid: number
  charityPartners: number
  totalCharityContributed: number
  featuredCharity: {
    id: string
    name: string
    description: string | null
    total_contributed: number
    hero_image_url: string | null
  } | null
}

export async function getPublicStats(): Promise<PublicStats> {
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysUntilDraw = Math.max(
    0,
    Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  const [
    { count: activeHeroes },
    { data: latestDraw },
    { data: paidWinners },
    { count: charityPartners },
    { data: charities },
    { data: featuredCharity },
  ] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'trialing']),
    supabaseAdmin
      .from('draws')
      .select('jackpot_rolled_over, rollover_amount, jackpot_amount, total_pool')
      .eq('status', 'completed')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin.from('draw_winners').select('amount').eq('payout_status', 'paid'),
    supabaseAdmin
      .from('charities')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabaseAdmin.from('charities').select('total_contributed').eq('is_deleted', false),
    supabaseAdmin.from('charities').select('*').eq('is_active', true).maybeSingle(),
  ])

  const { data: activeProfiles } = await supabaseAdmin
    .from('profiles')
    .select('subscription_plan')
    .in('subscription_status', ['active', 'trialing'])

  let monthlyPool = 0
  for (const p of activeProfiles || []) {
    const fee = getPlanPrice(p.subscription_plan)
    monthlyPool += p.subscription_plan === 'yearly' ? fee / 12 : fee
  }

  const rollover =
    latestDraw?.jackpot_rolled_over && latestDraw.rollover_amount
      ? Number(latestDraw.rollover_amount)
      : 0
  const netPool = monthlyPool * 0.9
  const currentJackpot = netPool * 0.4 + rollover

  const totalPaid = paidWinners?.reduce((sum, w) => sum + Number(w.amount || 0), 0) || 0
  const totalCharityContributed =
    charities?.reduce((sum, c) => sum + Number(c.total_contributed || 0), 0) || 0

  return {
    currentJackpot,
    daysUntilDraw,
    activeHeroes: activeHeroes || 0,
    totalPaid,
    charityPartners: charityPartners || 0,
    totalCharityContributed,
    featuredCharity: featuredCharity || null,
  }
}
