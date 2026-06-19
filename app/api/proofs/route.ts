import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { uploadProofSchema } from '@/validators/proof'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

/**
 * POST /api/proofs
 * Upload a winner proof. User must be a draw winner.
 * Accepts multipart/form-data with fields: file, drawWinnerId, drawId
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const drawWinnerId = formData.get('drawWinnerId') as string | null
    const drawId = formData.get('drawId') as string | null

    if (!file) throw errors.validation('File is required')

    // Validate metadata fields
    const parsed = uploadProofSchema.parse({ drawWinnerId, drawId })

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      throw errors.validation('File must be smaller than 10 MB')
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw errors.validation('File must be a JPEG, PNG, WebP, or PDF')
    }

    // Verify user is the actual winner
    const { data: winner } = await supabaseAdmin
      .from('draw_winners')
      .select('id, user_id')
      .eq('id', parsed.drawWinnerId)
      .eq('draw_id', parsed.drawId)
      .eq('user_id', user.id)
      .single()

    if (!winner) {
      throw errors.forbidden('You are not a winner for this draw')
    }

    // Check no proof already submitted
    const { data: existingProof } = await supabaseAdmin
      .from('winner_proofs')
      .select('id, status')
      .eq('draw_winner_id', parsed.drawWinnerId)
      .single()

    if (existingProof) {
      throw errors.conflict('You have already submitted proof for this win')
    }

    // Upload to Supabase Storage: winner-proofs/{userId}/{drawId}/{timestamp}.{ext}
    const ext = file.name.split('.').pop() ?? 'jpg'
    const storagePath = `${user.id}/${drawId}/${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { data: storageData, error: uploadErr } = await supabaseAdmin
      .storage
      .from('winner-proofs')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

    // Get public/signed URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('winner-proofs')
      .getPublicUrl(storagePath)

    // Save proof record
    const { data: proof, error: dbErr } = await supabaseAdmin
      .from('winner_proofs')
      .insert({
        draw_winner_id: parsed.drawWinnerId,
        user_id: user.id,
        draw_id: parsed.drawId,
        proof_url: urlData.publicUrl,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (dbErr) throw new Error(dbErr.message)

    return NextResponse.json({ data: proof, error: null }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid proof submission', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}

/**
 * GET /api/proofs
 * Admin: list all proofs, filterable by status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      throw errors.forbidden()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20'), 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('winner_proofs')
      .select(`
        *,
        profiles (id, name, avatar_url),
        draws (month, year),
        draw_winners (tier, amount)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
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
