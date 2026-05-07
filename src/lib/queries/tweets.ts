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
  )
`

export async function getFeedTweets(userId: string) {
  const supabase = await createClient()

  // Get IDs of users the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = follows?.map((f) => f.following_id) ?? []
  const feedUserIds = [...followingIds, userId] // include own tweets

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('user_id', feedUserIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllTweets() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}
