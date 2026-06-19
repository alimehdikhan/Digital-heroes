"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// Add a reusable admin verification function
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
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

export async function updateUserSubscription(userId: string, status: string, plan: string) {
  await verifyAdmin()
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      subscription_status: status,
      subscription_plan: plan === 'none' ? null : plan
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
  // We'll mock some historical data for the charts since we don't have months of real data yet
  // but we will also fetch real current aggregates to anchor the end of the charts.

  const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeSubs } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
  
  const { data: draws } = await supabaseAdmin.from('draws').select('total_pool, created_at').order('created_at', { ascending: true })
  
  const currentTotalUsers = totalUsers || 0
  const currentActiveSubs = activeSubs || 0

  // Mocked time series data for Area Chart (User Growth)
  const userGrowthData = [
    { name: 'Jan', total: Math.floor(currentTotalUsers * 0.4), active: Math.floor(currentActiveSubs * 0.3) },
    { name: 'Feb', total: Math.floor(currentTotalUsers * 0.6), active: Math.floor(currentActiveSubs * 0.5) },
    { name: 'Mar', total: Math.floor(currentTotalUsers * 0.7), active: Math.floor(currentActiveSubs * 0.7) },
    { name: 'Apr', total: Math.floor(currentTotalUsers * 0.8), active: Math.floor(currentActiveSubs * 0.8) },
    { name: 'May', total: Math.floor(currentTotalUsers * 0.9), active: Math.floor(currentActiveSubs * 0.9) },
    { name: 'Jun', total: currentTotalUsers, active: currentActiveSubs },
  ]

  // Mocked time series data for Stacked Bar (Financials)
  // Pool is ~10x the charity minimum contribution
  const financialData = [
    { name: 'Jan', pool: 12000, charity: 1200 },
    { name: 'Feb', pool: 24000, charity: 2400 },
    { name: 'Mar', pool: 35000, charity: 3500 },
    { name: 'Apr', pool: 40000, charity: 4000 },
    { name: 'May', pool: 45000, charity: 4500 },
    { name: 'Jun', pool: draws && draws.length > 0 ? draws[draws.length-1].total_pool : 50000, charity: draws && draws.length > 0 ? draws[draws.length-1].total_pool * 0.1 : 5000 },
  ]

  return {
    userGrowthData,
    financialData
  }
}
