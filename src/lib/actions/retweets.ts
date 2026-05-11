'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const SUPABASE_STORAGE_PREFIX = 'https://ujohfqnxtmoraufztjob.supabase.co/storage/v1/object/public/'

export async function retweet(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Q-007: Check tweet exists and no block in either direction
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

    if (block) throw new Error('Cannot retweet this tweet')
  }

  const { data: existing } = await supabase
    .from('tweets')
    .select('id')
    .eq('user_id', user.id)
    .eq('retweet_of_id', tweetId)
    .is('reply_to_id', null)
    .single()

  if (existing) {
    await supabase.from('tweets').delete().eq('id', existing.id)
  } else {
    const { error } = await supabase.from('tweets').insert({
      user_id: user.id,
      content: '',
      retweet_of_id: tweetId,
    })
    if (error && error.code !== '23505') throw new Error(error.message)
  }

  revalidatePath('/home')
}

export async function quoteTweet(tweetId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Q-015: Validate content length
  const trimmed = content?.trim() ?? ''
  if (!trimmed) throw new Error('Quote tweet cannot be empty')
  if (trimmed.length > 280) throw new Error('Quote tweet cannot exceed 280 characters')

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
