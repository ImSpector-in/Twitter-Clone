import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'
import { createClient } from '@/lib/supabase/server'

const URL_REGEX = /https?:\/\/[^\s<>"']+/g

const SHORTENER_HOSTS = new Set([
  'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly',
  'buff.ly', 'ift.tt', 'youtu.be', 'short.io', 'rb.gy', 'cutt.ly',
])

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

async function isPrivateHost(urlStr: string): Promise<boolean> {
  let hostname: string
  try { hostname = new URL(urlStr).hostname } catch { return true }
  if (!hostname || hostname === 'localhost') return true
  if (METADATA_HOSTS.has(hostname.toLowerCase())) return true
  try {
    const { address } = await dns.lookup(hostname, { family: 4 })
    return isPrivateIp(address)
  } catch {
    return true
  }
}

async function expandUrl(url: string): Promise<string> {
  try {
    const hostname = new URL(url).hostname
    if (!SHORTENER_HOSTS.has(hostname)) return url
    let current = url
    for (let i = 0; i < 5; i++) {
      const res = await fetch(current, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(4000) })
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) break
        let next: string
        try { next = new URL(location, current).toString() } catch { break }
        if (await isPrivateHost(next)) return url
        current = next
        continue
      }
      break
    }
    if (await isPrivateHost(current)) return url
    return current
  } catch {
    return url
  }
}

async function checkSafeBrowsing(urls: string[]): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) return false
  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'quotora', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.map((url) => ({ url })),
          },
        }),
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return !!(data.matches?.length)
  } catch { return false }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tweetId } = await req.json()
    if (!tweetId || typeof tweetId !== 'string') {
      return NextResponse.json({ error: 'Missing tweetId' }, { status: 400 })
    }

    const { data: tweet } = await supabase
      .from('tweets').select('id, content, user_id')
      .eq('id', tweetId).eq('user_id', user.id).single()

    if (!tweet) return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })

    const rawUrls = tweet.content.match(URL_REGEX) ?? []
    if (rawUrls.length === 0) {
      await supabase.from('tweets').update({ link_status: 'clean' }).eq('id', tweetId)
      return NextResponse.json({ status: 'clean' })
    }

    const expandedUrls = await Promise.all(rawUrls.map(expandUrl))
    const uniqueUrls = [...new Set(expandedUrls)]
    const flagged = await checkSafeBrowsing(uniqueUrls)
    const status = flagged ? 'flagged' : 'clean'
    await supabase.from('tweets').update({ link_status: status }).eq('id', tweetId)
    return NextResponse.json({ status })
  } catch {
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
