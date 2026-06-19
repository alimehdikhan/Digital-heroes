import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createCharitySchema } from '@/validators/charity'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

/**
 * GET /api/charities
 * Public: list all non-deleted charities
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_deleted', false)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ data, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}

/**
 * POST /api/charities
 * Admin-only: create a new charity
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      throw errors.forbidden()
    }

    const body = await request.json()
    const input = createCharitySchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({
        name: input.name,
        description: input.description ?? null,
        logo_url: input.logoUrl || null,
        website_url: input.websiteUrl || null,
        registered_number: input.registeredNumber ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: 'charity.create',
      p_entity_type: 'charity',
      p_entity_id: data.id,
      p_new_values: { name: input.name },
    })

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid charity data', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
