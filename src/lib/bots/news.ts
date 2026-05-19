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

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Quotora/1.0' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const declared = Number(res.headers.get('content-length') ?? '')
    if (Number.isFinite(declared) && declared > MAX_DECLARED_BYTES) return []
    const xml = await readBodyCapped(res)
    if (!xml) return []
    return parseItems(xml)
  } catch {
    return []
  }
}

// Accepts a set of already-posted URLs so we can avoid repeating articles.
// Fetches all feeds in parallel for a larger, more diverse candidate pool.
export async function fetchLatestAINews(excludeUrls: Set<string> = new Set()): Promise<NewsItem | null> {
  const feeds = [
    'https://techcrunch.com/tag/artificial-intelligence/feed/',
    'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    'https://venturebeat.com/category/ai/feed/',
  ]

  const results = await Promise.allSettled(feeds.map(fetchFeed))
  const allItems: NewsItem[] = []
  const seen = new Set<string>()

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      if (!seen.has(item.link)) {
        seen.add(item.link)
        allItems.push(item)
      }
    }
  }

  if (allItems.length === 0) return null

  // Prefer articles not already posted; fall back to full pool if everything was posted
  const fresh = allItems.filter(item => !excludeUrls.has(item.link))
  const pool = fresh.length > 0 ? fresh : allItems

  return pool[Math.floor(Math.random() * pool.length)]
}
