'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'

export async function toggleBookmark(tweetId: string) {
  const { user, supabase } = await requireUser()

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('tweet_id', tweetId)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('tweet_id', tweetId)
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, tweet_id: tweetId })
  }

  revalidatePath('/bookmarks')
}
