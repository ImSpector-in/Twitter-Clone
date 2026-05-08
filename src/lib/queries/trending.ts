export type NewsItem = {
  title: string
  link: string
  description: string
  pubDate: string
}

function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

  for (const item of itemMatches.slice(0, 20)) {
    const get = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : ''
    }
    const title = get('title')
    const link = get('link') || item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
    const description = get('description').replace(/<[^>]+>/g, '').slice(0, 160)
    const pubDate = get('pubDate')

    if (title && link) items.push({ title, link, description, pubDate })
  }

  return items
}

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 }, // cache 15 minutes
      headers: { 'User-Agent': 'TwitterClone/1.0' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRSS(xml)
  } catch {
    return []
  }
}

export async function getHackerNews() {
  return fetchFeed('https://hnrss.org/frontpage')
}

export async function getTradingNews() {
  return fetchFeed('https://feeds.marketwatch.com/marketwatch/topstories/')
}

export async function getHopecoreNews() {
  return fetchFeed('https://www.goodnewsnetwork.org/feed/')
}
