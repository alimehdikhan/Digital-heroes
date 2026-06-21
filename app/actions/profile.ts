"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  countryCode: z.string().max(2).optional(),
})

export type ProfileActionState = {
  error?: string | null;
  success?: string | null;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfile(prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const name = formData.get('name') as string
  const bioRaw = formData.get('bio') as string | null
  const bio = bioRaw?.trim() || undefined
  const currency = formData.get('currency') as string | null
  const countryCode = formData.get('countryCode') as string | null

  const validatedFields = updateProfileSchema.safeParse({
    name,
    bio,
    currency: currency || undefined,
    countryCode: countryCode || undefined,
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid input fields',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const updateData: Record<string, any> = {
    name: validatedFields.data.name,
  }
  if (validatedFields.data.currency) {
    updateData.currency = validatedFields.data.currency
  }
  if (validatedFields.data.countryCode) {
    updateData.country_code = validatedFields.data.countryCode
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: 'Profile updated successfully.' }
}
