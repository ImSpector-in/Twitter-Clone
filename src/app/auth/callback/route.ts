import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    // Password recovery — go straight to reset page, session is now established
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`)
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      // New OAuth user — send them to set a real username
      if (profile?.username?.startsWith('user_')) {
        return NextResponse.redirect(`${origin}/profile/edit?welcome=1`)
      }
    }
  }

  // Validate next param — must be a relative path, no protocol-relative tricks
  const rawNext = searchParams.get('next') ?? '/home'
  const safe = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')
    ? rawNext
    : '/home'

  return NextResponse.redirect(`${origin}${safe}`)
}
