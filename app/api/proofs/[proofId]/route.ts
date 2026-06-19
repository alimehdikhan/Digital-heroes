import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { reviewProofSchema } from '@/validators/proof'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ proofId: string }> }
) {
  try {
    const { proofId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      throw errors.forbidden()
    }

    const body = await request.json()
    const input = reviewProofSchema.parse(body)

    const { data: proof, error } = await supabaseAdmin
      .from('winner_proofs')
      .update({
        status: input.status,
        admin_note: input.adminNote ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proofId)
      .select()
      .single()

    if (error || !proof) throw errors.notFound('Proof')

    if (input.status === 'approved') {
      await supabaseAdmin
        .from('draw_winners')
        .update({ paid_out: true })
        .eq('id', proof.draw_winner_id)
    }

    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: `proof.${input.status}`,
      p_entity_type: 'winner_proof',
      p_entity_id: proofId,
      p_new_values: { status: input.status, adminNote: input.adminNote },
    })

    return NextResponse.json({ data: proof, error: null })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid review data', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
