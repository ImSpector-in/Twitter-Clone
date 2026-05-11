'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleFollow(targetUserId: string, targetUsername: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Q-016: Prevent self-follow
  if (targetUserId === user.id) throw new Error('Cannot follow yourself')

  // Q-007: Block check in either direction
  const { data: block } = await supabase
    .from('blocks')
    .select('blocker_id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${user.id})`)
    .limit(1)
    .single()

  if (block) throw new Error('Cannot follow this user')

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    // Q-017: Ignore duplicate key errors (race condition)
    if (error && error.code !== '23505') throw new Error(error.message)
  }

  revalidatePath(`/profile/${targetUsername}`)
  revalidatePath('/home')
}
