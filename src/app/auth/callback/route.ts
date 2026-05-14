import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Validate next param before the code exchange so we can use it for error redirects
  const rawNext = searchParams.get('next') ?? '/home'
  const safe = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')
    ? rawNext
    : '/home'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      // Exchange failed (expired link, wrong device, etc.) — send recovery flow back to request a new link
      if (safe === '/reset-password') {
        return NextResponse.redirect(`${origin}/forgot-password`)
      }
      return NextResponse.redirect(`${origin}/login`)
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

  return NextResponse.redirect(`${origin}${safe}`)
}
