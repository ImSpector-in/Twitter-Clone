export type NewsItem = {
  title: string
  link: string
  description: string
}

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
      const xml = await res.text()
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
