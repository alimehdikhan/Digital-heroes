"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserCharity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const charityId = formData.get('charityId') as string
  const percentage = parseInt(formData.get('charityPercentage') as string)

  if (!charityId) return { error: 'Invalid charity' }
  if (percentage < 10) return { error: 'Minimum contribution is 10%' }

  const { error } = await supabase.from('profiles').update({
    supported_charity_id: charityId,
    charity_percentage: percentage
  }).eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}
