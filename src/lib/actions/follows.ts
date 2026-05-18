'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import { isBlockedEitherDirection } from '@/lib/auth/blockCheck'
import { createClient } from '@/lib/supabase/server'
import { PG_UNIQUE_VIOLATION } from '@/lib/constants'

export async function toggleFollow(targetUserId: string, targetUsername: string) {
  const { user, supabase } = await requireUser()

  // Q-016: Prevent self-follow
  if (targetUserId === user.id) throw new Error('Cannot follow yourself')

  // Q-007: Block check in either direction
  if (await isBlockedEitherDirection(supabase, user.id, targetUserId)) {
    throw new Error('Cannot follow this user')
  }

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
    if (error && error.code !== PG_UNIQUE_VIOLATION) throw new Error(error.message)
  }

  revalidatePath(`/profile/${targetUsername}`)
  revalidatePath('/home')
}

// getUserRelationship returns defaults when unauthenticated — can't use requireUser
export async function getUserRelationship(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isFollowing: false, isMuted: false, isBlocked: false }

  const [followCheck, muteCheck, blockCheck] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle(),
    supabase.from('mutes').select('muter_id').eq('muter_id', user.id).eq('muted_id', targetUserId).maybeSingle(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', user.id).eq('blocked_id', targetUserId).maybeSingle(),
  ])

  return {
    isFollowing: !!followCheck.data,
    isMuted: !!muteCheck.data,
    isBlocked: !!blockCheck.data,
  }
}
