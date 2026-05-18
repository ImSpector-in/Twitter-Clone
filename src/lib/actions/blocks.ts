'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'

export async function blockUser(targetId: string) {
  const { user, supabase } = await requireUser()

  // Q-016: Prevent self-block
  if (targetId === user.id) throw new Error('Cannot block yourself')

  const { error: blockError } = await supabase
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: targetId })
  if (blockError) throw new Error(blockError.message)

  // Remove follow relationships in both directions — errors are non-fatal
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
  await supabase.from('follows').delete().eq('follower_id', targetId).eq('following_id', user.id)

  revalidatePath('/settings')
}

export async function unblockUser(targetId: string) {
  const { user, supabase } = await requireUser()

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId)
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}
