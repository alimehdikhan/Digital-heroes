"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, buildEmailTemplate } from '@/lib/email'
import { verifyAdmin } from '@/app/actions/admin'

const PROOF_BUCKET = 'winner-proofs'
const SIGNED_URL_EXPIRY = 3600 // 1 hour

export type ActionState = {
  error?: string | null
  success?: string | null
}

export async function submitWinnerProof(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get('proofFile') as File
  const winnerId = formData.get('winnerId') as string

  if (!file || !winnerId) {
    return { error: 'Missing file or winner ID' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: winner } = await supabase
    .from('draw_winners')
    .select('*')
    .eq('id', winnerId)
    .single()

  if (!winner || winner.user_id !== user.id) {
    return { error: 'Invalid winner record' }
  }

  const { data: existingProofs } = await supabase
    .from('winner_proofs')
    .select('id, status')
    .eq('draw_winner_id', winnerId)
    .order('created_at', { ascending: false })

  const latestProof = existingProofs && existingProofs.length > 0 ? existingProofs[0] : null

  if (latestProof && latestProof.status !== 'rejected') {
    return { error: 'Proof has already been submitted and is currently pending or verified.' }
  }

  // Upload to Supabase Storage using admin client to bypass RLS
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${winner.draw_id}/${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return { error: 'Failed to upload proof. Ensure the file is a valid image or PDF.' }
  }

  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY)

  if (signedUrlError) {
    console.error('Signed URL Error:', signedUrlError)
    return { error: 'File uploaded but failed to generate access URL.' }
  }

  const proofUrl = signedUrlData.signedUrl

  const payload = {
    draw_winner_id: winnerId,
    user_id: user.id,
    draw_id: winner.draw_id,
    proof_url: proofUrl,
    storage_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    status: 'pending'
  }

  let dbError: { message: string } | null = null

  if (latestProof) {
    const { error } = await supabase
      .from('winner_proofs')
      .update({ ...payload, reviewed_by: null, admin_note: null, reviewed_at: null })
      .eq('id', latestProof.id)
    dbError = error
  } else {
    const { error } = await supabase
      .from('winner_proofs')
      .insert(payload)
    dbError = error
  }

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard')
  return { success: 'Proof submitted successfully. Awaiting admin review.' }
}

export async function reviewWinnerProof(proofId: string, status: 'approved' | 'rejected', notes?: string) {
  await verifyAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: proof } = await supabaseAdmin
    .from('winner_proofs')
    .select('draw_winner_id, user_id')
    .eq('id', proofId)
    .single()

  if (!proof) throw new Error('Proof not found')

  await supabaseAdmin
    .from('winner_proofs')
    .update({
      status,
      admin_note: notes ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', proofId)

  await supabaseAdmin.from('notifications').insert({
    user_id: proof.user_id,
    title: status === 'approved' ? 'Proof Verified' : 'Proof Rejected',
    message: status === 'approved'
      ? 'Your winner proof has been verified. Payout is being processed.'
      : `Your proof was rejected. Notes: ${notes || 'No notes provided.'}`,
    type: 'proof_status'
  })

  revalidatePath('/admin')
}

export async function markWinnerPaid(winnerId: string) {
  await verifyAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: proof } = await supabaseAdmin
    .from('winner_proofs')
    .select('id, status')
    .eq('draw_winner_id', winnerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proof || proof.status !== 'approved') {
    throw new Error('Winner proof must be approved before marking payout as paid')
  }

  const { data: winner } = await supabaseAdmin
    .from('draw_winners')
    .select('amount, user_id, profiles(name)')
    .eq('id', winnerId)
    .single()

  const { error } = await supabaseAdmin
    .from('draw_winners')
    .update({ payout_status: 'paid' })
    .eq('id', winnerId)

  if (error) throw new Error(error.message)

  if (winner?.user_id) {
    await supabaseAdmin.from('notifications').insert({
      user_id: winner.user_id,
      title: 'Payout Completed',
      message: `Your prize of ₹${Number(winner.amount).toLocaleString()} has been paid.`,
      type: 'payout_status',
    })

    try {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(winner.user_id)
      const email = authData.user?.email
      const name = (winner.profiles as Record<string, unknown>)?.name || 'Hero'
      const amount = Number(winner.amount || 0)

      if (email) {
        await sendEmail({
          to: email,
          subject: 'Your Prize Has Been Paid!',
          body: `Hi ${name}, your prize of ₹${amount} has been paid.`,
          html: buildEmailTemplate(
            'Prize Paid',
            `<p>Hello <strong>${name}</strong>,</p>
             <p>Your prize of <strong>₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been processed and paid.</p>`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            'View Dashboard'
          ),
        })
      }
    } catch {
      // Silently skip if email resolution fails
    }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

/**
 * Regenerate a signed URL for an existing proof.
 * Only the proof owner or an admin can access this.
 */
export async function getProofSignedUrl(proofId: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  const { data: proof } = await supabaseAdmin
    .from('winner_proofs')
    .select('storage_path, user_id')
    .eq('id', proofId)
    .single()

  if (!proof?.storage_path) throw new Error('Proof not found')
  if (!isAdmin && proof.user_id !== user.id) throw new Error('Unauthorized')

  const { data: signedUrlData, error } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(proof.storage_path, SIGNED_URL_EXPIRY)

  if (error) throw new Error('Failed to generate signed URL')

  return signedUrlData.signedUrl
}
