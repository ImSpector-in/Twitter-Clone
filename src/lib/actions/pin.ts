'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function pinTweet(tweetId: string, profileUsername: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_id')
    .eq('id', tweetId)
    .single()

  if (!tweet || tweet.user_id !== user.id) throw new Error('Cannot pin this tweet')

  const { error } = await supabase
    .from('profiles')
    .update({ pinned_tweet_id: tweetId })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/profile/${profileUsername}`)
}

export async function unpinTweet(profileUsername: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ pinned_tweet_id: null })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/profile/${profileUsername}`)
}
