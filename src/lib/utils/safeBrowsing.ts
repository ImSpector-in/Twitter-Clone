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

export async function scanUrls(urls: string[]): Promise<'clean' | 'flagged'> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) {
    console.warn('[safeBrowsing] No API key set — skipping scan')
    return 'clean'
  }

  try {
    const expanded = await Promise.all(urls.map(expandUrl))
    const unique = [...new Set(expanded)]

    console.log('[safeBrowsing] Scanning URLs:', unique)

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
            threatEntries: unique.map((url) => ({ url })),
          },
        }),
        signal: AbortSignal.timeout(5000),
      }
    )

    const data = await res.json()
    console.log('[safeBrowsing] Response:', res.status, JSON.stringify(data))

    if (!res.ok) {
      console.error('[safeBrowsing] API error:', res.status, JSON.stringify(data))
      return 'clean'
    }
    return data.matches?.length ? 'flagged' : 'clean'
  } catch (err) {
    console.error('[safeBrowsing] Error:', err)
    return 'clean'
  }
}
