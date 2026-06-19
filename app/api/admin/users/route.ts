import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { errors, formatApiError } from '@/lib/utils/errors'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw errors.unauthorized()
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw errors.forbidden()
  }
  return { user, profile }
}

/**
 * GET /api/admin/users
 * Admin: list all users (paginated, searchable by name/email)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '25'), 100)
    const search = searchParams.get('search') ?? ''
    const role = searchParams.get('role') ?? ''
    const status = searchParams.get('status') ?? ''
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (role && ['user', 'admin', 'super_admin'].includes(role)) {
      query = query.eq('role', role)
    }
    if (status && ['active', 'inactive', 'cancelled', 'trialing', 'past_due'].includes(status)) {
      query = query.eq('subscription_status', status)
    }

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    return NextResponse.json({
      data,
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error: null,
    })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
