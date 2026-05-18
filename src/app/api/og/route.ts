import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'
import { createClient } from '@/lib/supabase/server'

const PRIVATE_IPV4_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|0\.)/i

const METADATA_HOSTS = new Set([
  'metadata.google.internal',
  'metadata.google',
  'metadata.aws.internal',
  'metadata.internal',
  '100.100.100.200',
])

function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true
  if (METADATA_HOSTS.has(ip)) return true
  if (PRIVATE_IPV4_RE.test(ip)) return true
  if (ip.includes(':')) {
    const lc = ip.toLowerCase()
    if (lc.startsWith('fc') || lc.startsWith('fd') || lc.startsWith('fe80')) return true
  }
  return false
}

async function isSafeUrl(urlStr: string): Promise<boolean> {
  let parsed: URL
  try { parsed = new URL(urlStr) } catch { return false }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  const host = parsed.hostname
  if (!host || host === 'localhost') return false
  if (METADATA_HOSTS.has(host.toLowerCase())) return false
  try {
    const { address } = await dns.lookup(host, { family: 4 })
    return !isPrivateIp(address)
  } catch {
    return false
  }
}

function isSafeImageUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const { protocol } = new URL(url)
    if (protocol !== 'http:' && protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

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
    const image = isSafeImageUrl(extractMeta(html, 'og:image'))
    const siteName = extractMeta(html, 'og:site_name')
    return NextResponse.json({ title, description, image, siteName, url: rawUrl })
  } catch {
    return NextResponse.json(empty)
  }
}
