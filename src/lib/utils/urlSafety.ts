import { promises as dns } from 'dns'

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

export async function isSafeUrl(urlStr: string): Promise<boolean> {
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

export function toSafeAbsoluteUrl(url: string | null, baseUrl: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url, baseUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
}
