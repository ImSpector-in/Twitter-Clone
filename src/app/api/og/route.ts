import { NextRequest, NextResponse } from 'next/server'

// SSRF prevention — reject private/loopback IP ranges and localhost
const PRIVATE_IP_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|fc|fd)/i

function isSafeUrl(urlStr: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(urlStr)
  } catch {
    return false
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  const host = parsed.hostname
  if (host === 'localhost' || host === '::1') return false
  if (PRIVATE_IP_RE.test(host)) return false
  return true
}

function extractMeta(html: string, property: string): string | null {
  // Match both og: property and name= variants
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=['"](${property})['"'][^>]+content=['"]([^'"]*)['"']|<meta[^>]+content=['"]([^'"]*)['"'][^>]+(?:property|name)=['"](${property})['"]`,
    'i'
  )
  const m = html.match(re)
  if (!m) return null
  return m[2] || m[3] || null
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: null })
  }

  if (!isSafeUrl(rawUrl)) {
    return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: rawUrl })
  }

  try {
    const res = await fetch(rawUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        // Identify as a bot so sites serve full HTML
        'User-Agent': 'Mozilla/5.0 (compatible; Quotora/1.0; +https://quotora.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    if (!res.ok) {
      return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: rawUrl })
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: rawUrl })
    }

    // Only read the first 50 KB — OG tags are always in <head>
    const reader = res.body?.getReader()
    if (!reader) {
      return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: rawUrl })
    }

    let html = ''
    const decoder = new TextDecoder()
    let bytesRead = 0
    const MAX_BYTES = 50_000

    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      bytesRead += value.byteLength
      // Stop once we've seen </head> — no point reading further
      if (html.includes('</head>')) break
    }
    reader.cancel().catch(() => {})

    const title = extractMeta(html, 'og:title')
    const description = extractMeta(html, 'og:description')
    const image = extractMeta(html, 'og:image')
    const siteName = extractMeta(html, 'og:site_name')

    return NextResponse.json({ title, description, image, siteName, url: rawUrl })
  } catch {
    return NextResponse.json({ title: null, description: null, image: null, siteName: null, url: rawUrl })
  }
}
