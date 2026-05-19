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

  // If already following, unfollow
  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
    revalidatePath(`/profile/${targetUsername}`)
    revalidatePath('/home')
    return 'unfollowed' as const
  }

  // Check if target account is private
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', targetUserId)
    .single()

  if (targetProfile?.is_private) {
    // Check for an existing pending request
    const { data: existingRequest } = await supabase
      .from('follow_requests')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (existingRequest) {
      // Cancel the pending request
      await supabase
        .from('follow_requests')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
      revalidatePath(`/profile/${targetUsername}`)
      return 'request_cancelled' as const
    }

    // Send follow request and notify the account owner
    const { error } = await supabase
      .from('follow_requests')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error && error.code !== PG_UNIQUE_VIOLATION) throw new Error(error.message)

    await supabase.from('notifications').insert({
      user_id: targetUserId,
      actor_id: user.id,
      type: 'follow_request',
    })

    revalidatePath(`/profile/${targetUsername}`)
    return 'request_sent' as const
  }

  // Public account — follow directly
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetUserId })
  if (error && error.code !== PG_UNIQUE_VIOLATION) throw new Error(error.message)

  revalidatePath(`/profile/${targetUsername}`)
  revalidatePath('/home')
  return 'followed' as const
}

export async function approveFollowRequest(requesterId: string, requesterUsername: string) {
  const { user, supabase } = await requireUser()

  // Verify the request exists (RLS on follow_requests ensures we only see our own)
  const { data: request } = await supabase
    .from('follow_requests')
    .select('id')
    .eq('follower_id', requesterId)
    .eq('following_id', user.id)
    .maybeSingle()

  if (!request) return

  // Insert follow row (uses the new "approve follow requests" RLS policy)
  await supabase.from('follows').insert({
    follower_id: requesterId,
    following_id: user.id,
  })

  // Delete the request — order matters: insert first so RLS EXISTS check passes
  await supabase
    .from('follow_requests')
    .delete()
    .eq('follower_id', requesterId)
    .eq('following_id', user.id)

  // Notify the requester that their request was accepted
  await supabase.from('notifications').insert({
    user_id: requesterId,
    actor_id: user.id,
    type: 'follow_request_accepted',
  })

  revalidatePath('/notifications')
  revalidatePath(`/profile/${requesterUsername}`)
}

export async function denyFollowRequest(requesterId: string) {
  const { user, supabase } = await requireUser()

  await supabase
    .from('follow_requests')
    .delete()
    .eq('follower_id', requesterId)
    .eq('following_id', user.id)

  revalidatePath('/notifications')
}

// getUserRelationship returns defaults when unauthenticated — can't use requireUser
export async function getUserRelationship(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isFollowing: false, isMuted: false, isBlocked: false, hasPendingRequest: false }

  const [followCheck, muteCheck, blockCheck, requestCheck] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle(),
    supabase.from('mutes').select('muter_id').eq('muter_id', user.id).eq('muted_id', targetUserId).maybeSingle(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', user.id).eq('blocked_id', targetUserId).maybeSingle(),
    supabase.from('follow_requests').select('id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle(),
  ])

  return {
    isFollowing: !!followCheck.data,
    isMuted: !!muteCheck.data,
    isBlocked: !!blockCheck.data,
    hasPendingRequest: !!requestCheck.data,
  }
}
