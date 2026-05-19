import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/home', '/profile', '/notifications', '/tweet',
  '/discover', '/bookmarks', '/trending', '/settings', '/messages',
  '/setup/2fa',
]

// Routes that require a session (listed in PROTECTED_PATHS) but must NOT
// trigger AAL2 enforcement — either because they ARE the MFA challenge,
// or because the user is mid-enrollment (nextLevel flips to aal2 before
// verify completes, which would trap them in a redirect loop).
const MFA_EXEMPT_PATHS = ['/auth/mfa', '/setup/2fa']

const AUTH_PATHS = ['/login', '/signup']

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p))
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname)
}

async function enforceMfa(
  supabase: ReturnType<typeof createServerClient>,
  pathname: string
): Promise<string | null> {
  if (MFA_EXEMPT_PATHS.includes(pathname)) return null
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    return '/auth/mfa'
  }
  return null
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not add logic between createServerClient and supabase.auth.getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && (isProtectedPath(pathname) || pathname === '/auth/mfa')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  if (user && isProtectedPath(pathname)) {
    const mfaPath = await enforceMfa(supabase, pathname)
    if (mfaPath) {
      const url = request.nextUrl.clone()
      url.pathname = mfaPath
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
