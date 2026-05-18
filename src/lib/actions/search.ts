'use server'

import { createClient } from '@/lib/supabase/server'

// Q-010: Server-side tweet search with block/mute exclusions
export async function searchTweets(query: string) {
  if (!query || query.trim().length < 2) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get excluded user IDs (blocks + mutes)
  const [blocksBy, blocksOf, mutes] = await Promise.all([
    supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
    supabase.from('blocks').select('blocker_id').eq('blocked_id', user.id),
    supabase.from('mutes').select('muted_id').eq('muter_id', user.id),
  ])

  const excluded = new Set<string>([
    ...(blocksBy.data?.map((b) => b.blocked_id) ?? []),
    ...(blocksOf.data?.map((b) => b.blocker_id) ?? []),
    ...(mutes.data?.map((m) => m.muted_id) ?? []),
  ])

  // Use full-text search via the GIN index (tweets_content_fts_idx).
  // textSearch uses plainto_tsquery under the hood for websearch-style input,
  // which is safe against injection and hits the GIN index automatically.
  let dbQuery = supabase
    .from('tweets')
    .select('id, content, created_at, profiles!tweets_user_id_fkey (username, display_name, avatar_url)')
    .textSearch('content', query.trim(), { type: 'websearch', config: 'english' })
    .is('reply_to_id', null)
    .is('retweet_of_id', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (excluded.size > 0) {
    dbQuery = dbQuery.not('user_id', 'in', `(${[...excluded].join(',')})`)
  }

  const { data } = await dbQuery
  return (data as any) ?? []
}
