import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeRedirect(searchParams.get('next'))

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password`)
}
