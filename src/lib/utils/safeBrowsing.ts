import { promises as dns } from 'dns'

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

// Resolves hostname via DNS to catch decimal/hex/short IP forms and DNS rebinding
async function isPrivateHost(urlStr: string): Promise<boolean> {
  let hostname: string
  try {
    hostname = new URL(urlStr).hostname
  } catch {
    return true
  }
  if (!hostname) return true
  if (hostname === 'localhost') return true
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
      const res = await fetch(current, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(4000),
      })
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

export async function scanUrls(urls: string[]): Promise<'clean' | 'flagged'> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) {
    console.warn('[safeBrowsing] No API key set — skipping scan')
    return 'clean'
  }
  try {
    const expanded = await Promise.all(urls.map(expandUrl))
    const unique = [...new Set(expanded)]
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
    if (!res.ok) {
      console.error('[safeBrowsing] API error:', res.status)
      return 'clean'
    }
    const data = await res.json()
    return data.matches?.length ? 'flagged' : 'clean'
  } catch (err) {
    console.error('[safeBrowsing] Error:', err)
    return 'clean'
  }
}
