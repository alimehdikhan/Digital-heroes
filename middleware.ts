import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { isSubscriptionActive } from '@/lib/utils/subscription'

const SUBSCRIBER_ONLY_PREFIXES = ['/scores', '/draws', '/proofs']
const APP_PREFIXES = [
  '/dashboard',
  '/profile',
  '/scores',
  '/draws',
  '/proofs',
  '/notifications',
  '/admin',
]

export default async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAppRoute = APP_PREFIXES.some((p) => pathname.startsWith(p))
  const isAdminRoute = pathname.startsWith('/admin')
  const isSubscriberRoute = SUBSCRIBER_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
  const isScoresApi =
    pathname.startsWith('/api/scores') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)

  const redirectWithCookies = (url: URL) => {
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })
    return response
  }

  if (!user && isAppRoute) {
    return redirectWithCookies(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return redirectWithCookies(new URL('/dashboard', request.url))
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return redirectWithCookies(new URL('/dashboard', request.url))
    }
  }

  // PRD: real-time subscription check on every authenticated app/API request
  if (user && (isAppRoute || isScoresApi)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expires_at, role')
      .eq('id', user.id)
      .single()

    const hasAccess = isSubscriptionActive(profile)
    const isAdminUser = profile?.role === 'admin' || profile?.role === 'super_admin'

    if ((isSubscriberRoute || isScoresApi) && !hasAccess && !isAdminUser) {
      return redirectWithCookies(new URL('/pricing', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
