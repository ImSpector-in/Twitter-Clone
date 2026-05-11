'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLike(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Q-007: Look up tweet author and check for blocks
  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_id')
    .eq('id', tweetId)
    .single()

  if (tweet && tweet.user_id !== user.id) {
    const { data: block } = await supabase
      .from('blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${tweet.user_id}),and(blocker_id.eq.${tweet.user_id},blocked_id.eq.${user.id})`)
      .limit(1)
      .single()

    if (block) throw new Error('Cannot like this tweet')
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
    if (error && error.code !== '23505') throw new Error(error.message)
  }

  revalidatePath('/home')
}
