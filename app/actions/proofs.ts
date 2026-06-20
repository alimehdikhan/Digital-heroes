'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
      // If rejected, they can upload a new one, but we might want to delete the old one or just update it.
    }

    // Upload to Supabase Storage using Admin Client (bypasses RLS)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${winner.draw_id}-${Date.now()}.${fileExt}`
    const storagePath = `proofs/${fileName}`

    // We need to convert the File to an ArrayBuffer for Supabase Storage
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabaseAdmin.storage
      .from('winner-proofs')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage error:', uploadError)
      return { success: false, error: 'Failed to upload image' }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('winner-proofs')
      .getPublicUrl(storagePath)

    // Wait, PRD says "use authorized signed URLs". Since we changed the bucket to private, 
    // publicUrl won't work anymore. But the DB schema has `proof_url` as TEXT. 
    // We will still store the storagePath or a placeholder, but we must use signedUrls when accessing.
    // For now, let's keep getPublicUrl since DB might require it, but we won't rely on it.

    // Insert or update proof record
    if (existingProof) {
      await supabaseAdmin.from('winner_proofs').update({
        proof_url: publicUrlData.publicUrl,
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
        proof_url: publicUrlData.publicUrl,
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
  } catch (err: any) {
    console.error('Proof upload error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
