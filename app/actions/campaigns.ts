'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/actions/admin'

export type CampaignActionState = {
  error?: string | null
  success?: string | null
}

export async function getCampaigns() {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createCampaign(_prevState: CampaignActionState, formData: FormData): Promise<CampaignActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null
  const isActive = formData.get('is_active') === 'true'

  if (!name || name.length < 2) {
    return { error: 'Campaign name must be at least 2 characters' }
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return { error: 'Start date must be before end date' }
  }

  const { error } = await supabaseAdmin.from('campaigns').insert({
    name,
    start_date: startDate,
    end_date: endDate,
    is_active: isActive,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/campaigns')
  return { success: 'Campaign created successfully' }
}

export async function updateCampaign(id: string, _prevState: CampaignActionState, formData: FormData): Promise<CampaignActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null
  const isActive = formData.get('is_active') === 'true'

  const updates: Record<string, unknown> = {}
  if (name) updates.name = name
  if (startDate !== undefined) updates.start_date = startDate
  if (endDate !== undefined) updates.end_date = endDate
  updates.is_active = isActive

  const { error } = await supabaseAdmin
    .from('campaigns')
    .update(updates)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/campaigns')
  return { success: 'Campaign updated successfully' }
}

export async function deleteCampaign(id: string) {
  await verifyAdmin()

  await supabaseAdmin
    .from('draws')
    .update({ campaign_id: null })
    .eq('campaign_id', id)

  const { error } = await supabaseAdmin
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/campaigns')
}
