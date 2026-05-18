export type NewsItem = {
  title: string
  link: string
  description: string
}

const MAX_RSS_BYTES = 500 * 1024
const MAX_DECLARED_BYTES = 1024 * 1024

function parseItems(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

  for (const block of blocks.slice(0, 8)) {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : ''
    }
    const title = get('title')
    const rawLink = get('link') || block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
    const link = /^https?:\/\//i.test(rawLink) ? rawLink : ''
    const description = get('description').slice(0, 200)
    if (title && link) items.push({ title, link, description })
  }

  return items
}

async function readBodyCapped(res: Response): Promise<string | null> {
  const reader = res.body?.getReader()
  if (!reader) return null
  const decoder = new TextDecoder()
  let xml = ''
  let bytesRead = 0
  try {
    while (bytesRead < MAX_RSS_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      bytesRead += value.byteLength
      xml += decoder.decode(value, { stream: true })
    }
  } finally {
    reader.cancel().catch(() => {})
  }
  return xml
}

export async function fetchLatestAINews(): Promise<NewsItem | null> {
  const feeds = [
    'https://techcrunch.com/tag/artificial-intelligence/feed/',
    'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    'https://venturebeat.com/category/ai/feed/',
  ].sort(() => Math.random() - 0.5)

  for (const url of feeds) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Quotora/1.0' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue

      const declared = Number(res.headers.get('content-length') ?? '')
      if (Number.isFinite(declared) && declared > MAX_DECLARED_BYTES) continue

      const xml = await readBodyCapped(res)
      if (!xml) continue

      const items = parseItems(xml)
      if (items.length > 0) {
        return items[Math.floor(Math.random() * Math.min(items.length, 5))]
      }
    } catch {
      continue
    }
  }
  return null
}
