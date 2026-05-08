'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function retweet(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already retweeted
  const { data: existing } = await supabase
    .from('tweets')
    .select('id')
    .eq('user_id', user.id)
    .eq('retweet_of_id', tweetId)
    .is('reply_to_id', null)
    .single()

  if (existing) {
    // Undo retweet
    await supabase.from('tweets').delete().eq('id', existing.id)
  } else {
    // Retweet
    await supabase.from('tweets').insert({
      user_id: user.id,
      content: '',
      retweet_of_id: tweetId,
    })
  }

  revalidatePath('/home')
}

export async function quoteTweet(tweetId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('tweets').insert({
    user_id: user.id,
    content,
    retweet_of_id: tweetId,
  })

  revalidatePath('/home')
}
