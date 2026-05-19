'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { toggleFollow } from '@/lib/actions/follows'
import { Button } from '@/components/ui/button'

type FollowState = 'following' | 'requested' | 'not_following'

type Props = {
  targetUserId: string
  targetUsername: string
  initialIsFollowing: boolean
  initialHasPendingRequest?: boolean
}

export default function FollowButton({
  targetUserId,
  targetUsername,
  initialIsFollowing,
  initialHasPendingRequest = false,
}: Props) {
  const [state, setState] = useState<FollowState>(
    initialIsFollowing ? 'following'
    : initialHasPendingRequest ? 'requested'
    : 'not_following'
  )
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const prevState = state
    // Optimistic: toggle away from current state
    setState(state === 'following' || state === 'requested' ? 'not_following' : 'following')
    try {
      const result = await toggleFollow(targetUserId, targetUsername)
      if (result === 'followed') setState('following')
      else if (result === 'request_sent') setState('requested')
      else setState('not_following')
    } catch {
      setState(prevState)
      toast.error('Failed to update follow. Try again.')
    }
    setLoading(false)
  }

  const label =
    state === 'following' ? 'Following'
    : state === 'requested' ? 'Requested'
    : 'Follow'

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={state === 'not_following' ? 'default' : 'outline'}
      className="rounded-full px-5"
    >
      {label}
    </Button>
  )
}
