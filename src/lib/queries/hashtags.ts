import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

export type TrendingHashtag = { tag: string; count: number }

type HashtagTweetRow = {
  content: string | null
  created_at: string
}

export const getTrendingHashtags = unstable_cache(
  async function _getTrendingHashtags(limit = 8): Promise<TrendingHashtag[]> {
    const supabase = createPublicClient()

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('tweets')
      .select('content, created_at, profiles!tweets_user_id_fkey!inner(is_private)')
      .eq('profiles.is_private', false)
      .gte('created_at', since)
      .is('reply_to_id', null)
      .limit(500)

    if (!data) return []

    const tagTimestamps = new Map<string, Date[]>()
    for (const { content, created_at } of data as HashtagTweetRow[]) {
      const tags = content?.match(/#(\w+)/g) ?? []
      for (const tag of tags) {
        const key = tag.toLowerCase()
        if (!tagTimestamps.has(key)) tagTimestamps.set(key, [])
        tagTimestamps.get(key)!.push(new Date(created_at))
      }
    }

    const now = Date.now()
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
  },
  ['trending-hashtags'],
  { revalidate: 300 }
)
