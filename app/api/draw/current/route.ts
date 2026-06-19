import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { errors, formatApiError } from '@/lib/utils/errors'

/**
 * GET /api/draw/current
 * Public: returns the most recent completed draw, or the pending draw if none completed.
 */
export async function GET() {
  try {
    // Try most recent completed draw first
    let { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        charities (id, name, logo_url, website_url),
        draw_winners (
          id, tier, match_count, amount, user_id, matched_numbers,
          winner_proofs (id, status)
        )
      `)
      .eq('status', 'completed')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single()

    // Fall back to any pending draw
    if (error || !draw) {
      const { data: pending } = await supabaseAdmin
        .from('draws')
        .select('*, charities (id, name, logo_url)')
        .eq('status', 'pending')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .single()

      if (!pending) throw errors.notFound('Draw')
      draw = pending
    }

    return NextResponse.json({ data: draw, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
