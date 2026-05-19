import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeRedirect(raw: string | null, fallback = '/home'): string {
  if (!raw) return fallback
  try {
    const url = new URL(raw, 'https://placeholder.invalid')
    if (url.hostname !== 'placeholder.invalid') return fallback
    const path = url.pathname + url.search + url.hash
    if (!path.startsWith('/') || path.startsWith('//')) return fallback
    return path
  } catch {
    return fallback
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const safe = safeRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username?.startsWith('user_')) {
        return NextResponse.redirect(`${origin}/setup/2fa`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${safe}`)
}
