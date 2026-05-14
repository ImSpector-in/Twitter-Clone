import { createClient } from '@/lib/supabase/server'

export type TrendingHashtag = { tag: string; count: number }

export async function getTrendingHashtags(limit = 8): Promise<TrendingHashtag[]> {
  const supabase = await createClient()

  // Scan top-level tweets from the last 72 hours
  const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('tweets')
    .select('content')
    .gte('created_at', since)
    .is('reply_to_id', null)
    .limit(300)

  if (!data) return []

  const counts = new Map<string, number>()
  for (const { content } of data) {
    const tags = content?.match(/#(\w+)/g) ?? []
    for (const tag of tags) {
      const key = tag.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}
