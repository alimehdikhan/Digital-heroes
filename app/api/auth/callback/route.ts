import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = new URL(next, request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth error — redirect to login with error message
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
