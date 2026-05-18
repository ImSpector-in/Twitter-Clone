import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSafeUrl, toSafeAbsoluteUrl } from '@/lib/utils/urlSafety'

function extractMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=['"]${property}['"][^>]+content=['"]([^'"]*)['"']|<meta[^>]+content=['"]([^'"]*)['"'][^>]+(?:property|name)=['"]${property}['"]`,
    'i'
  )
  const m = html.match(re)
  if (!m) return null
  return m[1] || m[2] || null
}

async function fetchWithSafeRedirects(startUrl: string, maxHops = 5): Promise<Response | null> {
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
          Accept: 'text/html,application/xhtml+xml',
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const rawUrl = searchParams.get('url')
  const empty = { title: null, description: null, image: null, siteName: null, url: rawUrl }

  if (!rawUrl) return NextResponse.json(empty)
  if (!(await isSafeUrl(rawUrl))) return NextResponse.json({ ...empty, url: rawUrl })

  try {
    const res = await fetchWithSafeRedirects(rawUrl)
    if (!res || !res.ok) return NextResponse.json(empty)
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return NextResponse.json(empty)

    const reader = res.body?.getReader()
    if (!reader) return NextResponse.json(empty)
    let html = ''
    const decoder = new TextDecoder()
    let bytesRead = 0
    while (bytesRead < 50_000) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      bytesRead += value.byteLength
      if (html.includes('</head>')) break
    }
    reader.cancel().catch(() => {})

    const title = extractMeta(html, 'og:title')
    const description = extractMeta(html, 'og:description')
    const image = toSafeAbsoluteUrl(
      extractMeta(html, 'og:image') ?? extractMeta(html, 'twitter:image'),
      res.url
    )
    const siteName = extractMeta(html, 'og:site_name')
    return NextResponse.json({ title, description, image, siteName, url: rawUrl })
  } catch {
    return NextResponse.json(empty)
  }
}
