'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'

export async function muteUser(targetId: string) {
  const { user, supabase } = await requireUser()
  await supabase.from('mutes').insert({ muter_id: user.id, muted_id: targetId })
  revalidatePath('/settings')
}

export async function unmuteUser(targetId: string) {
  const { user, supabase } = await requireUser()
  await supabase.from('mutes').delete().eq('muter_id', user.id).eq('muted_id', targetId)
  revalidatePath('/settings')
}

export async function addMutedWord(word: string) {
  const { user, supabase } = await requireUser()
  await supabase.from('muted_words').insert({ user_id: user.id, word: word.toLowerCase().trim() })
  revalidatePath('/settings')
}

export async function removeMutedWord(id: string) {
  const { user, supabase } = await requireUser()
  await supabase.from('muted_words').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/settings')
}
