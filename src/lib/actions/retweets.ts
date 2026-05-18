'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import { isBlockedEitherDirection } from '@/lib/auth/blockCheck'
import { PG_UNIQUE_VIOLATION, TWEET_MAX_LENGTH } from '@/lib/constants'

export async function retweet(tweetId: string) {
  const { user, supabase } = await requireUser()

  // Q-007: Check tweet exists and no block in either direction
  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_id')
    .eq('id', tweetId)
    .single()

  if (!tweet) throw new Error('Tweet not found')

  if (tweet.user_id !== user.id) {
    if (await isBlockedEitherDirection(supabase, user.id, tweet.user_id)) {
      throw new Error('Cannot retweet this tweet')
    }
  }

  const { data: existingRows } = await supabase
    .from('tweets')
    .select('id')
    .eq('user_id', user.id)
    .eq('retweet_of_id', tweetId)
    .eq('content', '')
    .is('reply_to_id', null)

  if (existingRows && existingRows.length > 0) {
    await supabase.from('tweets').delete()
      .eq('user_id', user.id)
      .eq('retweet_of_id', tweetId)
      .eq('content', '')
      .is('reply_to_id', null)
  } else {
    const { error } = await supabase.from('tweets').insert({
      user_id: user.id,
      content: '',
      retweet_of_id: tweetId,
    })
    if (error && error.code !== PG_UNIQUE_VIOLATION) throw new Error(error.message)
  }

  revalidatePath('/home')
}

export async function quoteTweet(tweetId: string, content: string) {
  const { user, supabase } = await requireUser()

  // Q-015: Validate content length
  const trimmed = content?.trim() ?? ''
  if (!trimmed) throw new Error('Quote tweet cannot be empty')
  if (trimmed.length > TWEET_MAX_LENGTH) throw new Error(`Quote tweet cannot exceed ${TWEET_MAX_LENGTH} characters`)

  // Q-015: Verify parent tweet exists and no block
  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_id')
    .eq('id', tweetId)
    .single()

  if (!tweet) throw new Error('Tweet not found')

  if (tweet.user_id !== user.id) {
    const { data: block } = await supabase
      .from('blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${tweet.user_id}),and(blocker_id.eq.${tweet.user_id},blocked_id.eq.${user.id})`)
      .limit(1)
      .single()

    if (block) throw new Error('Cannot quote this tweet')
  }

  await supabase.from('tweets').insert({
    user_id: user.id,
    content: trimmed,
    retweet_of_id: tweetId,
  })

  revalidatePath('/home')
}
