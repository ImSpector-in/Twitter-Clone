import { createClient } from '@/lib/supabase/server'

const TWEET_SELECT = `
  id,
  content,
  created_at,
  user_id,
  profiles!tweets_user_id_fkey (
    username,
    display_name,
    avatar_url
  ),
  likes (count)
`

async function attachLikedBy(tweets: any[], userId: string) {
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
  }))
}

export async function getFeedTweets(userId: string) {
  const supabase = await createClient()

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = follows?.map((f) => f.following_id) ?? []
  const feedUserIds = [...followingIds, userId]

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('user_id', feedUserIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return attachLikedBy(data ?? [], userId)
}

export async function getAllTweets(userId?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  if (!userId) return data ?? []
  return attachLikedBy(data ?? [], userId)
}
