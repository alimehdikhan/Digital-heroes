'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const PROOF_BUCKET = 'winner-proofs'
const SIGNED_URL_EXPIRY = 3600 // 1 hour

export async function uploadWinnerProof(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    const winnerId = formData.get('winnerId') as string

    if (!file || !winnerId) {
      return { success: false, error: 'Missing file or winner ID' }
    }

    // Verify the user actually owns this winning record
    const { data: winner } = await supabaseAdmin
      .from('draw_winners')
      .select('id, draw_id, payout_status')
      .eq('id', winnerId)
      .eq('user_id', user.id)
      .single()

    if (!winner) {
      return { success: false, error: 'Winning record not found' }
    }

    if (winner.payout_status !== 'pending') {
      return { success: false, error: 'This winning record is already processed' }
    }

    // Check if proof already exists
    const { data: existingProof } = await supabaseAdmin
      .from('winner_proofs')
      .select('id, status')
      .eq('draw_winner_id', winnerId)
      .single()

    if (existingProof) {
      if (existingProof.status === 'pending') {
        return { success: false, error: 'A proof is already pending review' }
      }
      if (existingProof.status === 'approved') {
        return { success: false, error: 'Proof already approved' }
      }
    }

    // Upload to Supabase Storage using Admin Client (bypasses RLS)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${winner.draw_id}-${Date.now()}.${fileExt}`
    const storagePath = `proofs/${fileName}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PROOF_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage error:', uploadError)
      return { success: false, error: 'Failed to upload image' }
    }

    // Generate a signed URL for private bucket access (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      return { success: false, error: 'Failed to generate proof URL' }
    }

    const proofUrl = signedUrlData.signedUrl

    // Insert or update proof record
    if (existingProof) {
      await supabaseAdmin.from('winner_proofs').update({
        proof_url: proofUrl,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
        admin_note: null
      }).eq('id', existingProof.id)
    } else {
      await supabaseAdmin.from('winner_proofs').insert({
        draw_winner_id: winnerId,
        user_id: user.id,
        draw_id: winner.draw_id,
        proof_url: proofUrl,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending'
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/draws')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('Proof upload error:', err)
    return { success: false, error: message }
  }
}

/**
 * Regenerate a signed URL for an existing proof record.
 * Only the proof owner or an admin can access this.
 */
export async function getProofSignedUrl(proofId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if user is admin
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

    if (!proof?.storage_path) {
      return { success: false, error: 'Proof not found' }
    }

    // Only the proof owner or an admin can access the signed URL
    if (!isAdmin && proof.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: signedUrlData, error } = await supabaseAdmin.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(proof.storage_path, SIGNED_URL_EXPIRY)

    if (error) {
      return { success: false, error: 'Failed to generate URL' }
    }

    return { success: true, signedUrl: signedUrlData.signedUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return { success: false, error: message }
  }
}
