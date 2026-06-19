import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { errors, formatApiError } from '@/lib/utils/errors'

/**
 * GET /api/charities/active
 * Public: returns the currently active charity
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (error || !data) throw errors.notFound('Active charity')
    return NextResponse.json({ data, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
