'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/actions/admin'

export type OrgActionState = {
  error?: string | null
  success?: string | null
}

export async function getOrganizations() {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createOrganization(prevState: OrgActionState, formData: FormData): Promise<OrgActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const billingEmail = formData.get('billing_email') as string || null

  if (!name || name.length < 2) {
    return { error: 'Organization name must be at least 2 characters' }
  }

  const { error } = await supabaseAdmin.from('organizations').insert({
    name,
    billing_email: billingEmail,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/organizations')
  return { success: 'Organization created successfully' }
}

export async function updateOrganization(id: string, prevState: OrgActionState, formData: FormData): Promise<OrgActionState> {
  await verifyAdmin()

  const name = formData.get('name') as string
  const billingEmail = formData.get('billing_email') as string || null

  const updates: Record<string, unknown> = {}
  if (name) updates.name = name
  if (billingEmail !== undefined) updates.billing_email = billingEmail

  const { error } = await supabaseAdmin
    .from('organizations')
    .update(updates)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/organizations')
  return { success: 'Organization updated successfully' }
}

export async function deleteOrganization(id: string) {
  await verifyAdmin()

  await supabaseAdmin
    .from('profiles')
    .update({ org_id: null })
    .eq('org_id', id)

  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/organizations')
}
