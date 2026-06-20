import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all routes under /dashboard, /scores, /draws, /profile, /admin
  const protectedPaths = ['/dashboard', '/scores', '/draws', '/profile', '/admin']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    if (!user) {
      // no user, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // REAL-TIME SUBSCRIPTION STATUS CHECK
    // Only restrict highly-interactive routes like /scores/new if subscription is inactive
    // We allow access to /dashboard and /profile for restricted read-only viewing
    const restrictedPaths = ['/scores/new']
    const isRestrictedPath = restrictedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isRestrictedPath) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('id', user.id)
        .single()

      const isActive = profile ? ['active', 'trialing'].includes(profile.subscription_status) : false
      const isGracePeriod = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()

      if (!profile || (!isActive && !isGracePeriod)) {
        // Redirect to pricing or dashboard with an alert
        const url = request.nextUrl.clone()
        url.pathname = '/pricing'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
