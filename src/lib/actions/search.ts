'use server'

import { createClient } from '@/lib/supabase/server'

export type SearchedTweet = {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
}

// Q-010: Server-side tweet search with block/mute exclusions
export async function searchTweets(query: string): Promise<SearchedTweet[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [blocksBy, blocksOf, mutes, privateProfiles, following] = await Promise.all([
    supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
    supabase.from('blocks').select('blocker_id').eq('blocked_id', user.id),
    supabase.from('mutes').select('muted_id').eq('muter_id', user.id),
    supabase.from('profiles').select('id').eq('is_private', true).neq('id', user.id),
    supabase.from('follows').select('following_id').eq('follower_id', user.id).limit(2000),
  ])

  const followingSet = new Set(following.data?.map((f) => f.following_id) ?? [])
  const privateNotFollowed = (privateProfiles.data ?? [])
    .filter((p) => !followingSet.has(p.id))
    .map((p) => p.id)

  const excluded = new Set<string>([
    ...(blocksBy.data?.map((b) => b.blocked_id) ?? []),
    ...(blocksOf.data?.map((b) => b.blocker_id) ?? []),
    ...(mutes.data?.map((m) => m.muted_id) ?? []),
    ...privateNotFollowed,
  ])

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
  return (data ?? []) as unknown as SearchedTweet[]
}
