import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSafeUrl } from '@/lib/utils/urlSafety'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

async function fetchImageWithSafeRedirects(startUrl: string, maxHops = 5): Promise<Response | null> {
  let url = startUrl
  for (let i = 0; i < maxHops; i++) {
    let res: Response
    try {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Quotora/1.0; +https://quotora.app)',
          Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,image/*;q=0.8',
        },
      })
    } catch { return null }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return null
      let nextUrl: string
      try { nextUrl = new URL(location, url).toString() } catch { return null }
      if (!(await isSafeUrl(nextUrl))) return null
      url = nextUrl
      continue
    }
    return res
  }
  return null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse(null, { status: 401 })

  const rawUrl = request.nextUrl.searchParams.get('url')
  if (!rawUrl || !(await isSafeUrl(rawUrl))) return new NextResponse(null, { status: 400 })

  const res = await fetchImageWithSafeRedirects(rawUrl)
  if (!res || !res.ok) return new NextResponse(null, { status: 502 })

  const contentType = res.headers.get('content-type')?.split(';')[0].toLowerCase() ?? ''
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) return new NextResponse(null, { status: 415 })

  const contentLength = Number(res.headers.get('content-length') ?? 0)
  if (contentLength > MAX_IMAGE_BYTES) return new NextResponse(null, { status: 413 })

  const reader = res.body?.getReader()
  if (!reader) return new NextResponse(null, { status: 502 })

  const chunks: Uint8Array[] = []
  let bytesRead = 0
  while (bytesRead <= MAX_IMAGE_BYTES) {
    const { done, value } = await reader.read()
    if (done) break
    bytesRead += value.byteLength
    if (bytesRead > MAX_IMAGE_BYTES) {
      reader.cancel().catch(() => {})
      return new NextResponse(null, { status: 413 })
    }
    chunks.push(value)
  }

  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
