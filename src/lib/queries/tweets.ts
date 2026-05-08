import { createClient } from '@/lib/supabase/server'

const TWEET_SELECT = `
  id,
  content,
  created_at,
  user_id,
  reply_to_id,
  image_url,
  profiles!tweets_user_id_fkey (
    username,
    display_name,
    avatar_url
  ),
  likes (count),
  replies:tweets!reply_to_id (count)
`

export async function attachLikedBy(tweets: any[], userId: string) {
  if (tweets.length === 0) return tweets
  const supabase = await createClient()

  const { data: liked } = await supabase
    .from('likes')
    .select('tweet_id')
    .eq('user_id', userId)
    .in('tweet_id', tweets.map((t) => t.id))

  const likedSet = new Set(liked?.map((l) => l.tweet_id) ?? [])
  return tweets.map((t) => ({
    ...t,
    like_count: t.likes?.[0]?.count ?? 0,
    liked_by_me: likedSet.has(t.id),
    reply_count: t.replies?.[0]?.count ?? 0,
  }))
}

async function getExcludedUserIds(userId: string) {
  const supabase = await createClient()
  const [blocksBy, blocksOf, mutes, mutedWords] = await Promise.all([
    supabase.from('blocks').select('blocked_id').eq('blocker_id', userId),
    supabase.from('blocks').select('blocker_id').eq('blocked_id', userId),
    supabase.from('mutes').select('muted_id').eq('muter_id', userId),
    supabase.from('muted_words').select('word').eq('user_id', userId),
  ])
  const excluded = new Set<string>([
    ...(blocksBy.data?.map((b) => b.blocked_id) ?? []),
    ...(blocksOf.data?.map((b) => b.blocker_id) ?? []),
    ...(mutes.data?.map((m) => m.muted_id) ?? []),
  ])
  const mutedWordList = mutedWords.data?.map((w) => w.word) ?? []
  return { excluded, mutedWordList }
}

function filterMutedWords(tweets: any[], mutedWordList: string[]) {
  if (mutedWordList.length === 0) return tweets
  return tweets.filter((t) =>
    !mutedWordList.some((word) => t.content?.toLowerCase().includes(word))
  )
}

export async function getFeedTweets(userId: string) {
  const supabase = await createClient()
  const { excluded, mutedWordList } = await getExcludedUserIds(userId)

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = follows?.map((f) => f.following_id) ?? []
  const feedUserIds = [...followingIds, userId].filter((id) => !excluded.has(id))

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('user_id', feedUserIds)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  const filtered = filterMutedWords(data ?? [], mutedWordList)
  return attachLikedBy(filtered, userId)
}

export async function getAllTweets(userId?: string) {
  const supabase = await createClient()

  let excluded = new Set<string>()
  let mutedWordList: string[] = []
  if (userId) {
    const result = await getExcludedUserIds(userId)
    excluded = result.excluded
    mutedWordList = result.mutedWordList
  }

  let query = supabase.from('tweets').select(TWEET_SELECT).is('reply_to_id', null).order('created_at', { ascending: false }).limit(50)

  if (excluded.size > 0) {
    query = query.not('user_id', 'in', `(${[...excluded].join(',')})`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const filtered = filterMutedWords(data ?? [], mutedWordList)
  if (!userId) return filtered
  return attachLikedBy(filtered, userId)
}

export async function getTweetById(tweetId: string, userId?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .eq('id', tweetId)
    .single()

  if (error) return null
  if (!userId) return data
  const [withLikes] = await attachLikedBy([data], userId)
  return withLikes
}

export async function getReplies(tweetId: string, userId?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .eq('reply_to_id', tweetId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!userId) return data ?? []
  return attachLikedBy(data ?? [], userId)
}
