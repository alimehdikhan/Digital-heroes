"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/app/actions/admin'
import { revalidatePath } from 'next/cache'

export async function getOrganizations() {
  await verifyAdmin()
  const { data: orgs } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  return orgs || []
}

export async function createOrganization(formData: FormData) {
  await verifyAdmin()
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-')
  const billingEmail = formData.get('billingEmail') as string
  const plan = (formData.get('plan') as string) || 'team'

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }

  const { error } = await supabaseAdmin.from('organizations').insert({
    name,
    slug,
    billing_email: billingEmail || null,
    plan,
    country_code: 'IN',
    subscription_status: 'inactive',
    is_active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/organizations')
  return { success: true }
}

export async function updateOrganization(id: string, formData: FormData) {
  await verifyAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const billingEmail = formData.get('billingEmail') as string
  const plan = formData.get('plan') as string
  const isActive = formData.get('isActive') === 'true'

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' }

  const updateData: Record<string, any> = { name }
  if (slug) updateData.slug = slug
  if (billingEmail) updateData.billing_email = billingEmail
  if (plan) updateData.plan = plan
  updateData.is_active = isActive

  const { error } = await supabaseAdmin.from('organizations').update(updateData).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/organizations')
  return { success: true }
}

export async function assignUserToOrg(userId: string, orgId: string) {
  await verifyAdmin()
  const { error } = await supabaseAdmin.from('profiles').update({ org_id: orgId }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
