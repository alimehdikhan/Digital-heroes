"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, buildEmailTemplate } from '@/lib/email'
import { getPlanPrice } from '@/lib/pricing'

// Add a reusable admin verification function
export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Forbidden: Admin access required')
  }
}

export async function getAdminUsers() {
  await verifyAdmin()
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, subscription_status, subscription_plan, created_at, org_id(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  return users
}

export async function updateUserProfile(userId: string, status: string, plan: string, name: string, role: string) {
  await verifyAdmin()
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      subscription_status: status,
      subscription_plan: plan === 'none' ? null : plan,
      name: name,
      role: role
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getAdminScores() {
  await verifyAdmin()
  const { data: scores, error } = await supabaseAdmin
    .from('scores')
    .select('id, user_id, score, date, notes, profiles(name)')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching admin scores:', error)
    return []
  }

  return scores
}

export async function updateScore(scoreId: string, newScore: number) {
  await verifyAdmin()
  if (newScore < 1 || newScore > 45) {
    return { error: 'Score must be between 1 and 45.' }
  }

  const { error } = await supabaseAdmin
    .from('scores')
    .update({ score: newScore })
    .eq('id', scoreId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteScore(scoreId: string) {
  await verifyAdmin()
  const { error } = await supabaseAdmin
    .from('scores')
    .delete()
    .eq('id', scoreId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getCharities() {
  // Public access is sometimes needed for charities, but we protect admin-only actions below
  const { data: charities } = await supabaseAdmin
    .from('charities')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
  
  return charities || []
}

export async function createCharity(formData: FormData) {
  await verifyAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const hero_image_url = formData.get('hero_image_url') as string
  const eventsRaw = formData.get('events') as string
  const events = eventsRaw ? JSON.parse(eventsRaw) : []
  
  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }
  
  const { error } = await supabaseAdmin.from('charities').insert({
    name,
    description,
    hero_image_url,
    events
  })
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateCharity(id: string, formData: FormData) {
  await verifyAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const hero_image_url = formData.get('hero_image_url') as string
  const eventsRaw = formData.get('events') as string
  const events = eventsRaw ? JSON.parse(eventsRaw) : []

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }

  const { error } = await supabaseAdmin.from('charities').update({
    name,
    description,
    hero_image_url,
    events
  }).eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCharity(id: string) {
  await verifyAdmin()
  // Soft delete so we don't break foreign keys on past donations
  const { error } = await supabaseAdmin.from('charities').update({
    is_deleted: true,
    is_active: false
  }).eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function setActiveCharity(id: string) {
  await verifyAdmin()
  // Disable all active
  await supabaseAdmin.from('charities').update({ is_active: false }).eq('is_active', true)
  // Enable the new one
  const { error } = await supabaseAdmin.from('charities').update({ is_active: true }).eq('id', id)
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function getAnalyticsData() {
  await verifyAdmin()

  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  const { count: activeSubs } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('subscription_status', ['active', 'trialing'])

  const { data: profilesByMonth } = await supabaseAdmin
    .from('profiles')
    .select('created_at, subscription_status')
    .order('created_at', { ascending: true })

  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select('total_pool, charity_contribution, month, year, created_at, participant_count, jackpot_rolled_over')
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const userGrowthMap = new Map<string, { total: number; active: number }>()
  const financialMap = new Map<string, { pool: number; charity: number }>()

  for (const p of profilesByMonth || []) {
    const d = new Date(p.created_at)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    const entry = userGrowthMap.get(key) || { total: 0, active: 0 }
    entry.total += 1
    if (['active', 'trialing'].includes(p.subscription_status)) entry.active += 1
    userGrowthMap.set(key, entry)
  }

  for (const draw of draws || []) {
    const key = `${monthNames[draw.month - 1]} ${draw.year}`
    financialMap.set(key, {
      pool: Number(draw.total_pool || 0),
      charity: Number(draw.charity_contribution || 0),
    })
  }

  const userGrowthData = Array.from(userGrowthMap.entries()).slice(-6).map(([name, v]) => ({
    name,
    total: v.total,
    active: v.active,
  }))

  const financialData = Array.from(financialMap.entries()).slice(-6).map(([name, v]) => ({
    name,
    pool: v.pool,
    charity: v.charity,
  }))

  if (userGrowthData.length === 0) {
    userGrowthData.push({
      name: monthNames[new Date().getMonth()],
      total: totalUsers || 0,
      active: activeSubs || 0,
    })
  }

  const { data: charities } = await supabaseAdmin
    .from('charities')
    .select('id, name, total_contributed, is_active')
    .eq('is_deleted', false)
    .order('total_contributed', { ascending: false })

  const drawStats = {
    totalDraws: draws?.length || 0,
    rollovers: draws?.filter((d) => d.jackpot_rolled_over).length || 0,
    avgParticipants:
      draws && draws.length > 0
        ? Math.round(
            draws.reduce((acc, d) => acc + (d.participant_count || 0), 0) / draws.length
          )
        : 0,
  }

  return {
    userGrowthData,
    financialData,
    summary: {
      totalUsers: totalUsers || 0,
      activeSubs: activeSubs || 0,
      totalCharity: charities?.reduce((acc, c) => acc + Number(c.total_contributed || 0), 0) || 0,
      totalPool: draws?.reduce((acc, d) => acc + Number(d.total_pool || 0), 0) || 0,
    },
    charities: charities || [],
    drawStats,
  }
}

export async function getAdminMetrics() {
  await verifyAdmin()

  const { count: activeSubs } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).in('subscription_status', ['active', 'trialing'])
  
  const { data: charities } = await supabaseAdmin.from('charities').select('total_contributed')
  const totalCharity = charities?.reduce((acc, c) => acc + (c.total_contributed || 0), 0) || 0

  const { data: draws } = await supabaseAdmin.from('draws').select('total_pool')
  const totalPoolAllTime = draws?.reduce((acc, d) => acc + (d.total_pool || 0), 0) || 0

  // For current jackpot size, we can mock a simulation call, or just use the last rollover + current pool
  const { data: activeProfiles } = await supabaseAdmin.from('profiles').select('subscription_plan, charity_percentage').in('subscription_status', ['active', 'trialing'])
  let calculatedPool = 0
  if (activeProfiles && activeProfiles.length > 0) {
    for (const p of activeProfiles) {
      const fee = getPlanPrice(p.subscription_plan)
      const monthlyEquivalent = p.subscription_plan === 'yearly' ? fee / 12 : fee
      calculatedPool += monthlyEquivalent
    }
  }
  const poolAmount = calculatedPool > 0 ? calculatedPool : 0

  const { data: previousDraw } = await supabaseAdmin.from('draws').select('jackpot_rolled_over, rollover_amount').eq('status', 'completed').order('created_at', { ascending: false }).limit(1).single()
  const rolloverAmount = previousDraw?.jackpot_rolled_over ? previousDraw.rollover_amount : 0
  const currentJackpot = (poolAmount * 0.90 * 0.40) + rolloverAmount // roughly net pool * 40% + rollover

  return {
    totalRevenue: totalPoolAllTime + poolAmount, // Approximate total revenue
    activeHeroes: activeSubs || 0,
    currentJackpot,
    totalCharity
  }
}

export async function verifyProof(proofId: string, action: 'approve' | 'reject') {
  await verifyAdmin()

  const { data: proof } = await supabaseAdmin
    .from('winner_proofs')
    .select('id, draw_winner_id, status')
    .eq('id', proofId)
    .single()

  if (!proof || proof.status !== 'pending') {
    return { success: false, error: 'Proof not found or already processed' }
  }

  // Update proof status
  const { error: proofError } = await supabaseAdmin
    .from('winner_proofs')
    .update({ 
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', proofId)

  if (proofError) {
    return { success: false, error: 'Failed to update proof status' }
  }

  // Approve/reject proof only — payout is marked separately (PRD: Pending → Paid)
  if (action === 'approve') {
    const { data: winnerInfo } = await supabaseAdmin
      .from('draw_winners')
      .select('amount, user_id, profiles(name)')
      .eq('id', proof.draw_winner_id)
      .single()

    if (winnerInfo?.user_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: winnerInfo.user_id,
        title: 'Proof Verified',
        message: 'Your winner proof has been approved. Payout will be processed shortly.',
        type: 'proof_status',
      })
    }

    if (winnerInfo?.user_id) {
      const name = (winnerInfo.profiles as any)?.name || 'Hero'
      const amount = Number(winnerInfo.amount || 0)

      // Securely resolve email via admin API (auth_users join is blocked by Supabase RLS)
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(winnerInfo.user_id)
        const email = authData.user?.email

        if (email) {
          await sendEmail({
            to: email,
            subject: 'Winner Proof Approved',
            body: `Hi ${name}, your proof was approved. Your payout is being processed.`,
            html: buildEmailTemplate(
              'Proof Approved',
              `<p>Hello <strong>${name}</strong>,</p>
               <p>Your winning scorecard has been verified by our team.</p>
               <p>Your prize of <strong>₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> will be paid out shortly.</p>`,
              `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
              'View Dashboard'
            ),
          })
        }
      } catch {
        // Silently skip if email resolution fails — notification was already sent
      }
    }
  } else {
    // If rejected, we might want to change payout_status back to something else, or keep it pending
    // so the user can upload a new proof.
    await supabaseAdmin
      .from('draw_winners')
      .update({ payout_status: 'pending' })
      .eq('id', proof.draw_winner_id)
  }

  // Use dynamic import for revalidatePath to avoid edge issues if needed, but it's safe in server action
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/draws')
  revalidatePath('/dashboard')

  return { success: true }
}
