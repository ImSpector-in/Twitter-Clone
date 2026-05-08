import { createClient } from '@/lib/supabase/server'

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url,
      is_private,
      created_at
    `)
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

export async function getTweetsByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(`
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
    `)
    .eq('user_id', userId)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFollowers(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('profiles!follows_follower_id_fkey (id, username, display_name, avatar_url)')
    .eq('following_id', userId)
  return data?.map((d) => d.profiles).filter(Boolean) ?? []
}

export async function getFollowing(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('profiles!follows_following_id_fkey (id, username, display_name, avatar_url)')
    .eq('follower_id', userId)
  return data?.map((d) => d.profiles).filter(Boolean) ?? []
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient()

  const [followersResult, followingResult] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])

  return {
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0,
  }
}
