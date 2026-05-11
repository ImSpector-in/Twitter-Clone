'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const SUPABASE_STORAGE_PREFIX = 'https://ujohfqnxtmoraufztjob.supabase.co/storage/v1/object/public/'

function validateImageUrl(url: string | undefined): string | null {
  if (!url) return null
  if (!url.startsWith(SUPABASE_STORAGE_PREFIX)) throw new Error('Invalid image URL')
  return url
}

function validateContent(content: string): string {
  const trimmed = content?.trim() ?? ''
  if (!trimmed) throw new Error('Tweet cannot be empty')
  if (trimmed.length > 280) throw new Error('Tweet cannot exceed 280 characters')
  return trimmed
}

export async function createTweet(content: string, replyToId?: string, imageUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validatedContent = validateContent(content)
  const validatedImageUrl = validateImageUrl(imageUrl)

  // Q-020: DB-based rate limit — max 30 tweets per hour
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const { count } = await supabase
    .from('tweets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneHourAgo)
  if ((count ?? 0) >= 30) throw new Error('You\'re posting too fast. Please wait a while.')

  // Validate replyToId is a UUID if provided
  if (replyToId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(replyToId)) {
    throw new Error('Invalid reply target')
  }

  // Enforce reply scope server-side
  if (replyToId) {
    const { data: parentTweet } = await supabase
      .from('tweets')
      .select('user_id, profiles!tweets_user_id_fkey (reply_scope)')
      .eq('id', replyToId)
      .single()

    if (!parentTweet) throw new Error('Tweet not found')

    const authorId = parentTweet.user_id
    const replyScope = (parentTweet.profiles as any)?.reply_scope ?? 'everyone'

    if (replyScope === 'nobody') throw new Error('Replies are disabled on this tweet')

    if (replyScope === 'followers') {
      const { data: follow } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', authorId)
        .single()
      if (!follow && user.id !== authorId) throw new Error('Only followers can reply to this tweet')
    }

    // Block check — cannot reply if blocked in either direction
    const { data: block } = await supabase
      .from('blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${authorId}),and(blocker_id.eq.${authorId},blocked_id.eq.${user.id})`)
      .limit(1)
      .single()

    if (block) throw new Error('Cannot reply to this tweet')
  }

  const { error } = await supabase
    .from('tweets')
    .insert({
      content: validatedContent,
      user_id: user.id,
      reply_to_id: replyToId ?? null,
      image_url: validatedImageUrl,
    })

  if (error) throw new Error(error.message)

  revalidatePath('/home')
  if (replyToId) revalidatePath(`/tweet/${replyToId}`)
}

export async function deleteTweet(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tweets')
    .delete()
    .eq('id', tweetId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/home')
}
