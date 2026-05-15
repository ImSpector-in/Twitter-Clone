import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const URL_REGEX = /https?:\/\/[^\s<>"']+/g

const SHORTENER_HOSTS = new Set([
  'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly',
  'buff.ly', 'ift.tt', 'youtu.be', 'short.io', 'rb.gy', 'cutt.ly',
])

// Q-030: block SSRF targets that redirect to internal/private addresses
const PRIVATE_IP_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|fc|fd)/i

function isPrivateHost(urlStr: string): boolean {
  try {
    const { hostname } = new URL(urlStr)
    return hostname === 'localhost' || hostname === '::1' || PRIVATE_IP_RE.test(hostname)
  } catch {
    return true
  }
}

async function expandUrl(url: string): Promise<string> {
  try {
    const hostname = new URL(url).hostname
    if (!SHORTENER_HOSTS.has(hostname)) return url
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
    })
    const expanded = res.url
    if (isPrivateHost(expanded)) return url
    return expanded
  } catch {
    return url
  }
}

async function checkSafeBrowsing(urls: string[]): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) return false

  try {
    const res = await fetch(
      `https://safebrowsingapis.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
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
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify the caller is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tweetId } = await req.json()
    if (!tweetId || typeof tweetId !== 'string') {
      return NextResponse.json({ error: 'Missing tweetId' }, { status: 400 })
    }

    // Fetch the tweet — must belong to this user
    const { data: tweet } = await supabase
      .from('tweets')
      .select('id, content, user_id')
      .eq('id', tweetId)
      .eq('user_id', user.id)
      .single()

    if (!tweet) return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })

    const rawUrls = tweet.content.match(URL_REGEX) ?? []
    if (rawUrls.length === 0) {
      await supabase.from('tweets').update({ link_status: 'clean' }).eq('id', tweetId)
      return NextResponse.json({ status: 'clean' })
    }

    // Expand shorteners so Safe Browsing sees the real destination
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
