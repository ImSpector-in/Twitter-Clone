'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLike(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('tweet_id', tweetId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('tweet_id', tweetId)
  } else {
    await supabase.from('likes').insert({ user_id: user.id, tweet_id: tweetId })
  }

  revalidatePath('/home')
}
