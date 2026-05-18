import { createClient } from '@/lib/supabase/server'

export type TrendingHashtag = { tag: string; count: number }

export async function getTrendingHashtags(limit = 8): Promise<TrendingHashtag[]> {
  const supabase = await createClient()

  // Only count hashtag uses from the last 7 days — older activity shouldn't
  // contribute to trending scores at all.
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('tweets')
    .select('content, created_at')
    .gte('created_at', since)
    .is('reply_to_id', null)
    .limit(500)

  if (!data) return []

  // Collect every (tag, created_at) pair so we can compute a per-tag score.
  const tagTimestamps = new Map<string, Date[]>()
  for (const { content, created_at } of data) {
    const tags = content?.match(/#(\w+)/g) ?? []
    for (const tag of tags) {
      const key = tag.toLowerCase()
      if (!tagTimestamps.has(key)) tagTimestamps.set(key, [])
      tagTimestamps.get(key)!.push(new Date(created_at))
    }
  }

  const now = Date.now()

  // Hacker News-style time-decay: score = count / (age_in_hours + 2)^1.5
  // We use the age of the *earliest* use inside the window so that a hashtag
  // that has been used many times recently scores higher than one with a single
  // ancient use.
  const scored = [...tagTimestamps.entries()].map(([tag, timestamps]) => {
    const count = timestamps.length
    const oldestMs = Math.min(...timestamps.map((d) => d.getTime()))
    const ageHours = (now - oldestMs) / (1000 * 60 * 60)
    const score = count / Math.pow(ageHours + 2, 1.5)
    return { tag, count, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ tag, count }) => ({ tag, count }))
}
