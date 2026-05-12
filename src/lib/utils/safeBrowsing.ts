const SHORTENER_HOSTS = new Set([
  'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'is.gd', 'ow.ly',
  'buff.ly', 'ift.tt', 'youtu.be', 'short.io', 'rb.gy', 'cutt.ly',
])

async function expandUrl(url: string): Promise<string> {
  try {
    const hostname = new URL(url).hostname
    if (!SHORTENER_HOSTS.has(hostname)) return url
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
    })
    return res.url
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
            threatEntries: unique.map((url) => ({ url })),
          },
        }),
        signal: AbortSignal.timeout(5000),
      }
    )

    const data = await res.json()
    console.log('[safeBrowsing] Response:', res.status, JSON.stringify(data))

    if (!res.ok) return 'clean'
    return data.matches?.length ? 'flagged' : 'clean'
  } catch (err) {
    console.error('[safeBrowsing] Error:', err)
    return 'clean'
  }
}
