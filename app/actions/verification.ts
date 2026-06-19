"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

export type ActionState = {
  error?: string | null;
  success?: string | null;
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

  // Get the winner record
  const { data: winner } = await supabase
    .from('draw_winners')
    .select('*')
    .eq('id', winnerId)
    .single()

  if (!winner || winner.user_id !== user.id) {
    return { error: 'Invalid winner record' }
  }

  // Guard against multiple submissions
  const { data: existingProof } = await supabase
    .from('winner_proofs')
    .select('id')
    .eq('draw_winner_id', winnerId)
    .single()
    
  if (existingProof) {
    return { error: 'Proof has already been submitted for this win.' }
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${winner.draw_id}/${fileName}`

  // Ensure the bucket exists (this should be handled in DB migrations usually)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('winner_proofs')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return { error: 'Failed to upload proof. Ensure the file is a valid image or PDF.' }
  }

  const { data: publicUrlData } = supabase.storage
    .from('winner_proofs')
    .getPublicUrl(filePath)

  const { error: insertError } = await supabase
    .from('winner_proofs')
    .insert({
      draw_winner_id: winnerId,
      user_id: user.id,
      draw_id: winner.draw_id,
      proof_url: publicUrlData.publicUrl,
      storage_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: 'pending'
    })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/dashboard')
  return { success: 'Proof submitted successfully. Awaiting admin review.' }
}

export async function reviewWinnerProof(proofId: string, status: 'approved' | 'rejected', notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check if admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get proof
  const { data: proof } = await supabaseAdmin
    .from('winner_proofs')
    .select('draw_winner_id, user_id')
    .eq('id', proofId)
    .single()

  if (!proof) throw new Error('Proof not found')

  // Update proof status
  await supabaseAdmin
    .from('winner_proofs')
    .update({
      status,
      admin_note: notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', proofId)

  // Ensure status reflects approved state but not necessarily paid
  // Wait, no update to payout_status here. It's handled by markWinnerPaid.

  // Notify the user
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check if admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Update payout status
  const { error } = await supabaseAdmin
    .from('draw_winners')
    .update({ payout_status: 'paid' })
    .eq('id', winnerId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}
