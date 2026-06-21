"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  charity_id: z.string().uuid('Please select a charity to support'),
  charity_percentage: z.number().min(10).max(100).default(10),
})

export type ActionState = {
  error?: string | null;
  success?: string | null;
  fieldErrors?: Record<string, string[]>;
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validatedFields = loginSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    return {
      error: 'Invalid input fields',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const charity_id = formData.get('charity_id') as string
    const charity_percentage_raw = formData.get('charity_percentage')
    const charity_percentage = charity_percentage_raw ? parseInt(charity_percentage_raw as string, 10) : undefined

    const validatedFields = registerSchema.safeParse({ email, password, name, charity_id, charity_percentage })

    if (!validatedFields.success) {
      return {
        error: 'Invalid input fields',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const supabase = await createClient()

    const metaData = {
      full_name: name,
      supported_charity_id: charity_id,
      charity_percentage: charity_percentage ?? 10,
    }

    // Supabase Auth Signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    })

    if (error) {
      console.error('Supabase signup error:', error)
      return { error: error.message ? String(error.message) : 'Auth API Error. Check server console.' }
    }

    if (data.session) {
      revalidatePath('/', 'layout')
      redirect('/pricing')
    }

    return { success: 'Check your email to confirm your account.' }
  } catch (err: any) {
    // Next.js redirect() throws an error to navigate. We must re-throw it!
    if (err?.message === 'NEXT_REDIRECT') throw err;
    
    console.error('Signup error:', err)
    return { error: err?.message ? String(err.message) : 'An unexpected error occurred during signup. Check server console.' }
  }
}

export async function forgotPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string

  const validatedFields = z.object({ email: z.string().email('Invalid email address') }).safeParse({ email })

  if (!validatedFields.success) {
    return {
      error: 'Invalid email address',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for the password reset link.' }
}

export async function resetPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const validatedFields = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }).safeParse({ password })

  if (!validatedFields.success) {
    return {
      error: 'Invalid password',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password updated successfully.' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
