import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { updateCharitySchema } from '@/validators/charity'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw errors.unauthorized()
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw errors.forbidden()
  }
  return user
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ charityId: string }> }
) {
  try {
    const { charityId } = await params
    const user = await requireAdmin()
    const body = await request.json()
    const input = updateCharitySchema.parse(body)

    if (input.isActive === true) {
      await supabaseAdmin
        .from('charities')
        .update({ is_active: false })
        .neq('id', charityId)
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.logoUrl !== undefined && { logo_url: input.logoUrl || null }),
        ...(input.websiteUrl !== undefined && { website_url: input.websiteUrl || null }),
        ...(input.registeredNumber !== undefined && { registered_number: input.registeredNumber }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      })
      .eq('id', charityId)
      .eq('is_deleted', false)
      .select()
      .single()

    if (error || !data) throw errors.notFound('Charity')

    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: 'charity.update',
      p_entity_type: 'charity',
      p_entity_id: charityId,
      p_new_values: input as Record<string, unknown>,
    })

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid charity update', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ charityId: string }> }
) {
  try {
    const { charityId } = await params
    const user = await requireAdmin()

    const { error } = await supabaseAdmin
      .from('charities')
      .update({ is_deleted: true, is_active: false })
      .eq('id', charityId)

    if (error) throw new Error(error.message)

    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: 'charity.delete',
      p_entity_type: 'charity',
      p_entity_id: charityId,
    })

    return NextResponse.json({ data: { deleted: true }, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
