import { createClient } from '@/lib/supabase/server'
import { TWEET_SELECT, attachOriginals, attachLikedBy } from '@/lib/queries/tweets'
import type { TweetWithProfile, RawTweet, RawTweetWithOriginal } from '@/types'

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
      is_admin,
      created_at,
      pinned_tweet_id
    `)
    .eq('username', username)
    .single()

  if (error) return null
  return data
}

export async function getTweetsByUserId(profileUserId: string, viewingUserId?: string): Promise<TweetWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .eq('user_id', profileUserId)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)

  const raw = (data ?? []) as unknown as RawTweet[]
  const withOriginals = await attachOriginals(raw)
  if (!viewingUserId) return withOriginals.map(rawToPublic)
  return attachLikedBy(withOriginals, viewingUserId)
}

function rawToPublic(t: RawTweetWithOriginal): TweetWithProfile {
  return {
    id: t.id,
    content: t.content,
    created_at: t.created_at,
    edited_at: t.edited_at,
    user_id: t.user_id,
    reply_to_id: t.reply_to_id,
    retweet_of_id: t.retweet_of_id,
    image_url: t.image_url,
    gif_url: t.gif_url,
    reply_scope: t.reply_scope,
    link_status: t.link_status,
    profiles: t.profiles,
    like_count: t.likes?.[0]?.count ?? 0,
    liked_by_me: false,
    reply_count: t.replies?.[0]?.count ?? 0,
    retweet_count: t.retweets?.[0]?.count ?? 0,
    retweeted_by_me: false,
    bookmarked_by_me: false,
    original: null,
  }
}

export async function getCurrentUserProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', userId)
    .single()
  return data
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .limit(2000)
  return data?.map((f) => f.following_id) ?? []
}

export async function getRelationshipStatus(viewerId: string, targetId: string) {
  const supabase = await createClient()
  const [followCheck, blockCheck, muteCheck] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('follower_id', viewerId).eq('following_id', targetId).single(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', viewerId).eq('blocked_id', targetId).single(),
    supabase.from('mutes').select('muter_id').eq('muter_id', viewerId).eq('muted_id', targetId).single(),
  ])
  return {
    isFollowing: !!followCheck.data,
    isBlocked: !!blockCheck.data,
    isMuted: !!muteCheck.data,
  }
}

export async function getFollowers(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('profiles!follows_follower_id_fkey (id, username, display_name, avatar_url)')
    .eq('following_id', userId)
    .limit(200)
  return data?.map((d) => d.profiles).filter(Boolean) ?? []
}

export async function getFollowing(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('profiles!follows_following_id_fkey (id, username, display_name, avatar_url)')
    .eq('follower_id', userId)
    .limit(200)
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
