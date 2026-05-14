export type NewsItem = {
  title: string
  link: string
  description: string
  pubDate: string
  commentCount?: number
  commentsLink?: string
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
    const rawLink = get('link') || item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
    // Q-028: Only allow http/https links from RSS feeds to prevent javascript: injection
    const link = /^https?:\/\//i.test(rawLink) ? rawLink : ''

    const rawDesc = get('description')

    // Extract HN comment count if present (hnrss.org format)
    const commentsMatch = rawDesc.match(/Comments:\s*(\d+)/)
    const commentCount = commentsMatch ? parseInt(commentsMatch[1]) : undefined

    // Strip HTML tags and the HN metadata line from description
    const description = rawDesc
      .replace(/<[^>]+>/g, '')
      .replace(/Points:\s*\d+\s*\|\s*Comments:\s*\d+/gi, '')
      .trim()
      .slice(0, 160)

    const pubDate = get('pubDate')

    const rawComments = get('comments')
    const commentsLink = /^https?:\/\//i.test(rawComments) ? rawComments : undefined

    if (title && link) items.push({ title, link, description, pubDate, commentCount, commentsLink })
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
