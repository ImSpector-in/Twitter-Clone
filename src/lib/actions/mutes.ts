'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function muteUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('mutes').insert({ muter_id: user.id, muted_id: targetId })
  revalidatePath('/settings')
}

export async function unmuteUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('mutes').delete().eq('muter_id', user.id).eq('muted_id', targetId)
  revalidatePath('/settings')
}

export async function addMutedWord(word: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('muted_words').insert({ user_id: user.id, word: word.toLowerCase().trim() })
  revalidatePath('/settings')
}

export async function removeMutedWord(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('muted_words').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/settings')
}
