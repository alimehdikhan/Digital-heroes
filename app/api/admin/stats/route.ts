import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { errors, formatApiError } from '@/lib/utils/errors'

/**
 * GET /api/admin/stats
 * Admin: platform-wide statistics dashboard
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      throw errors.forbidden()
    }

    // Use the DB function for atomic stats
    const { data: stats, error } = await supabaseAdmin
      .rpc('get_admin_stats')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ data: stats, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
