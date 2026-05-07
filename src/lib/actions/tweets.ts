'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createTweet(content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tweets')
    .insert({ content, user_id: user.id })

  if (error) throw new Error(error.message)

  revalidatePath('/home')
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
