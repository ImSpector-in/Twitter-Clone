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
      profiles!tweets_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
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
