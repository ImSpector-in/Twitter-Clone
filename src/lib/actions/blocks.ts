'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function blockUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Q-016: Prevent self-block
  if (targetId === user.id) throw new Error('Cannot block yourself')

  await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetId })
  // Also remove any follow relationship in both directions
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
  await supabase.from('follows').delete().eq('follower_id', targetId).eq('following_id', user.id)

  revalidatePath('/settings')
}

export async function unblockUser(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetId)
  revalidatePath('/settings')
}
