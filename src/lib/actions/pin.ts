'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'

export async function pinTweet(tweetId: string, profileUsername: string) {
  const { user, supabase } = await requireUser()

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
  const { user, supabase } = await requireUser()

  const { error } = await supabase
    .from('profiles')
    .update({ pinned_tweet_id: null })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/profile/${profileUsername}`)
}
