'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import { isBlockedEitherDirection } from '@/lib/auth/blockCheck'
import { PG_UNIQUE_VIOLATION } from '@/lib/constants'

export async function toggleLike(tweetId: string) {
  const { user, supabase } = await requireUser()

  // Q-007: Look up tweet author and check for blocks
  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_id')
    .eq('id', tweetId)
    .single()

  if (tweet && tweet.user_id !== user.id) {
    if (await isBlockedEitherDirection(supabase, user.id, tweet.user_id)) {
      throw new Error('Cannot like this tweet')
    }
  }

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('tweet_id', tweetId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('tweet_id', tweetId)
  } else {
    const { error } = await supabase.from('likes').insert({ user_id: user.id, tweet_id: tweetId })
    // Q-017: Ignore duplicate key errors (race condition)
    if (error && error.code !== PG_UNIQUE_VIOLATION) throw new Error(error.message)
  }

  revalidatePath('/home')
}
