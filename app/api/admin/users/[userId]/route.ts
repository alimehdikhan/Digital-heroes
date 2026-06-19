import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { updateUserSchema } from '@/validators/subscription'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: actorProfile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (!actorProfile || !['admin', 'super_admin'].includes(actorProfile.role)) {
      throw errors.forbidden()
    }

    const body = await request.json()
    const input = updateUserSchema.parse(body)

    if (
      input.role &&
      ['admin', 'super_admin'].includes(input.role) &&
      actorProfile.role !== 'super_admin'
    ) {
      throw errors.forbidden('Only super admins can assign admin roles')
    }

    const { data: previous } = await supabaseAdmin
      .from('profiles').select('role, subscription_status').eq('id', userId).single()

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...(input.role !== undefined && { role: input.role }),
        ...(input.subscriptionStatus !== undefined && {
          subscription_status: input.subscriptionStatus,
        }),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error || !updated) throw errors.notFound('User')

    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: 'admin.user.update',
      p_entity_type: 'profile',
      p_entity_id: userId,
      p_old_values: previous as Record<string, unknown>,
      p_new_values: input as Record<string, unknown>,
    })

    return NextResponse.json({ data: updated, error: null })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid user update', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
