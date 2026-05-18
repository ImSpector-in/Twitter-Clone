import { createClient } from '@/lib/supabase/server'
import type { TweetWithProfile, RawTweet, RawTweetWithOriginal } from '@/types'

export const TWEET_SELECT = `
  id,
  content,
  created_at,
  edited_at,
  user_id,
  reply_to_id,
  retweet_of_id,
  image_url,
  gif_url,
  reply_scope,
  link_status,
  profiles!tweets_user_id_fkey (
    username,
    display_name,
    avatar_url,
    is_admin
  ),
  likes (count),
  replies:tweets!reply_to_id (count),
  retweets:tweets!retweet_of_id (count)
`

// Supabase infers nested relations differently than our declared types, so we
// use `unknown` as an intermediate to silence the incompatibility warnings.
// Runtime values are correct — this is purely a type-inference gap.
function toRawTweets(data: unknown): RawTweet[] {
  return (data as unknown[]) as RawTweet[]
}

export async function attachOriginals(tweets: RawTweet[]): Promise<RawTweetWithOriginal[]> {
  const supabase = await createClient()
  const retweetIds = tweets
    .filter((t) => t.retweet_of_id)
    .map((t) => t.retweet_of_id as string)

  if (retweetIds.length === 0) return tweets.map((t) => ({ ...t, original: null }))

  const { data: originals } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('id', retweetIds)

  const originalsById = new Map(toRawTweets(originals ?? []).map((t) => [t.id, t]))

  return tweets.map((t) => ({
    ...t,
    original: t.retweet_of_id ? (originalsById.get(t.retweet_of_id) ?? null) : null,
  }))
}

export async function attachLikedBy(tweets: RawTweetWithOriginal[], userId: string): Promise<TweetWithProfile[]> {
  if (tweets.length === 0) return []
  const supabase = await createClient()

  const tweetIds = tweets.map((t) => t.id)
  const originalIds = tweets.filter((t) => t.original).map((t) => t.original!.id)
  const allIds = [...new Set([...tweetIds, ...originalIds])]

  const [likedRes, bookmarkedRes, retweetedRes] = await Promise.all([
    supabase.from('likes').select('tweet_id').eq('user_id', userId).in('tweet_id', allIds),
    supabase.from('bookmarks').select('tweet_id').eq('user_id', userId).in('tweet_id', allIds),
    supabase.from('tweets').select('retweet_of_id').eq('user_id', userId).in('retweet_of_id', allIds).is('reply_to_id', null),
  ])

  const likedSet = new Set(likedRes.data?.map((l) => l.tweet_id) ?? [])
  const bookmarkedSet = new Set(bookmarkedRes.data?.map((b) => b.tweet_id) ?? [])
  const retweetedSet = new Set(retweetedRes.data?.map((r) => r.retweet_of_id) ?? [])

  function annotate(t: RawTweet): TweetWithProfile {
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
      liked_by_me: likedSet.has(t.id),
      reply_count: t.replies?.[0]?.count ?? 0,
      retweet_count: t.retweets?.[0]?.count ?? 0,
      retweeted_by_me: retweetedSet.has(t.id),
      bookmarked_by_me: bookmarkedSet.has(t.id),
    }
  }

  return tweets.map((t) => ({
    ...annotate(t),
    original: t.original ? annotate(t.original) : null,
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

function filterMutedWords(tweets: RawTweet[], mutedWordList: string[]): RawTweet[] {
  if (mutedWordList.length === 0) return tweets
  return tweets.filter((t) =>
    !mutedWordList.some((word) => t.content?.toLowerCase().includes(word))
  )
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
    original: t.original ? {
      id: t.original.id,
      content: t.original.content,
      created_at: t.original.created_at,
      edited_at: t.original.edited_at,
      user_id: t.original.user_id,
      reply_to_id: t.original.reply_to_id,
      retweet_of_id: t.original.retweet_of_id,
      image_url: t.original.image_url,
      gif_url: t.original.gif_url,
      reply_scope: t.original.reply_scope,
      link_status: t.original.link_status,
      profiles: t.original.profiles,
      like_count: t.original.likes?.[0]?.count ?? 0,
      liked_by_me: false,
      reply_count: t.original.replies?.[0]?.count ?? 0,
      retweet_count: t.original.retweets?.[0]?.count ?? 0,
      retweeted_by_me: false,
      bookmarked_by_me: false,
    } : null,
  }
}

const PAGE_SIZE = 20

export type PaginatedTweetsResult = {
  tweets: TweetWithProfile[]
  nextCursor: string | null
}

export async function getFeedTweets(userId: string, cursor?: string | null): Promise<PaginatedTweetsResult> {
  const supabase = await createClient()
  const { excluded, mutedWordList } = await getExcludedUserIds(userId)

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .limit(2000)

  const followingIds = follows?.map((f) => f.following_id) ?? []
  const feedUserIds = [...followingIds, userId].filter((id) => !excluded.has(id))

  let query = supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('user_id', feedUserIds)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const filtered = filterMutedWords(toRawTweets(data ?? []), mutedWordList)
  const withOriginals = await attachOriginals(filtered)
  const tweets = await attachLikedBy(withOriginals, userId)
  const nextCursor = tweets.length === PAGE_SIZE ? tweets[tweets.length - 1].created_at : null
  return { tweets, nextCursor }
}

export async function getAllTweets(userId?: string, cursor?: string | null): Promise<PaginatedTweetsResult> {
  const supabase = await createClient()

  let excluded = new Set<string>()
  let mutedWordList: string[] = []
  if (userId) {
    const result = await getExcludedUserIds(userId)
    excluded = result.excluded
    mutedWordList = result.mutedWordList
  }

  let query = supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (excluded.size > 0) {
    query = query.not('user_id', 'in', `(${[...excluded].join(',')})`)
  }

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const filtered = filterMutedWords(toRawTweets(data ?? []), mutedWordList)
  const withOriginals = await attachOriginals(filtered)
  const tweets = !userId
    ? withOriginals.map(rawToPublic)
    : await attachLikedBy(withOriginals, userId)
  const nextCursor = tweets.length === PAGE_SIZE ? tweets[tweets.length - 1].created_at : null
  return { tweets, nextCursor }
}

export async function getTweetById(tweetId: string, userId?: string): Promise<TweetWithProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .eq('id', tweetId)
    .single()

  if (error) return null
  const [withOriginal] = await attachOriginals(toRawTweets([data]))
  if (!userId) return rawToPublic(withOriginal)
  const [withLikes] = await attachLikedBy([withOriginal], userId)
  return withLikes
}

export async function getTweetsByHashtag(tag: string, userId?: string): Promise<TweetWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .ilike('content', `%#${tag}%`)
    .is('reply_to_id', null)
    .is('retweet_of_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  const withOriginals = await attachOriginals(toRawTweets(data ?? []))
  if (!userId) return withOriginals.map(rawToPublic)
  return attachLikedBy(withOriginals, userId)
}

export async function getBookmarkedTweets(userId: string): Promise<TweetWithProfile[]> {
  const supabase = await createClient()

  const { data: bookmarkData } = await supabase
    .from('bookmarks')
    .select('tweet_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const tweetIds = bookmarkData?.map((b) => b.tweet_id) ?? []
  if (tweetIds.length === 0) return []

  const { data, error } = await supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .in('id', tweetIds)

  if (error) throw new Error(error.message)
  const raw = toRawTweets(data ?? [])

  // Re-sort to match bookmark order (newest bookmark first)
  const byId = new Map(raw.map((t) => [t.id, t]))
  const ordered = tweetIds.map((id) => byId.get(id)).filter((t): t is RawTweet => !!t)
  const withOriginals = await attachOriginals(ordered)
  return attachLikedBy(withOriginals, userId)
}

export async function getReplies(tweetId: string, userId?: string): Promise<TweetWithProfile[]> {
  const supabase = await createClient()

  // Q-027: Apply block/mute exclusions to thread replies
  let excluded = new Set<string>()
  if (userId) {
    const result = await getExcludedUserIds(userId)
    excluded = result.excluded
  }

  let query = supabase
    .from('tweets')
    .select(TWEET_SELECT)
    .eq('reply_to_id', tweetId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (excluded.size > 0) {
    query = query.not('user_id', 'in', `(${[...excluded].join(',')})`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const withOriginals = await attachOriginals(toRawTweets(data ?? []))
  if (!userId) return withOriginals.map(rawToPublic)
  return attachLikedBy(withOriginals, userId)
}
