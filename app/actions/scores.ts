"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addScoreSchema } from '@/validators/score'
import { z } from 'zod'

export type ActionState = {
  error?: string | null;
  success?: string | null;
  fieldErrors?: Record<string, string[]>;
}

export async function submitScore(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const scoreRaw = formData.get('score')
  const date = formData.get('date') as string
  const notesRaw = formData.get('notes') as string | null
  const notes = notesRaw ? notesRaw : undefined

  // Convert score to number
  const scoreNum = scoreRaw ? parseInt(scoreRaw as string, 10) : undefined

  const validatedFields = addScoreSchema.safeParse({ score: scoreNum, date, notes })

  if (!validatedFields.success) {
    return {
      error: 'Invalid input fields',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check active subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single()

  const isActive = profile ? ['active', 'trialing'].includes(profile.subscription_status) : false
  const isGracePeriod = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()
  
  if (!profile || (!isActive && !isGracePeriod)) {
    return { error: 'An active subscription is required to submit scores.' }
  }

  const { error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score: validatedFields.data.score,
      date: validatedFields.data.date,
      notes: validatedFields.data.notes ?? null,
    })

  if (error) {
    // Unique constraint = duplicate date
    if (error.code === '23505') {
      return { error: 'You already have a score registered for this date. Please edit or delete your existing score instead.' }
    }
    return { error: error.message }
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

  revalidatePath('/scores')
  revalidatePath('/dashboard')
  redirect('/scores')
}

export async function getLatestScores() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)

  return scores || []
}

export async function deleteUserScore(scoreId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('scores')
    .delete()
    .match({ id: scoreId, user_id: user.id })
  
  if (error) return { error: error.message }
  
  revalidatePath('/scores')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateUserScore(scoreId: string, newScore: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (newScore < 1 || newScore > 45) return { error: 'Invalid score' }

  const { error } = await supabase
    .from('scores')
    .update({ score: newScore })
    .match({ id: scoreId, user_id: user.id })
  
  if (error) return { error: error.message }
  
  revalidatePath('/scores')
  revalidatePath('/dashboard')
  return { success: true }
}
