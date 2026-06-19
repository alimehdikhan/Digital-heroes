import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addScoreSchema } from '@/validators/score'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

/**
 * GET /api/scores
 * Returns the authenticated user's scores (max 5, sorted by date DESC).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)

    if (error) throw new Error(error.message)

    return NextResponse.json({ data: scores, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}

/**
 * POST /api/scores
 * Add a new Stableford score.
 * Validates: 1–45 range, no future dates, one per date (enforced by DB unique constraint).
 * DB trigger enforces max 5 scores per user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    // Check active subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expires_at')
      .eq('id', user.id)
      .single()

    const isActive = profile && ['active', 'trialing'].includes(profile.subscription_status)
    const isGracePeriod = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()

    if (!profile || (!isActive && !isGracePeriod)) {
      throw errors.subscriptionRequired()
    }

    // Validate request body
    const body = await request.json()
    const validated = addScoreSchema.parse(body)

    const { data: score, error } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score: validated.score,
        date: validated.date,
        notes: validated.notes ?? null,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint = duplicate date
      if (error.code === '23505') {
        throw errors.conflict('You already have a score registered for this date. Please edit or delete your existing score instead.')
      }
      throw new Error(error.message)
    }

    // Edge Case: 6th score submitted → replace the oldest
    const { data: userScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (userScores && userScores.length > 5) {
      const scoresToDelete = userScores.slice(5).map(s => s.id)
      await supabase.from('scores').delete().in('id', scoresToDelete)
    }

    return NextResponse.json({ data: score, error: null }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid score data', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
