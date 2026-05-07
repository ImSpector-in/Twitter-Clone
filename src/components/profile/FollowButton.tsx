'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { toggleFollow } from '@/lib/actions/follows'
import { Button } from '@/components/ui/button'

type Props = {
  targetUserId: string
  targetUsername: string
  initialIsFollowing: boolean
}

export default function FollowButton({ targetUserId, targetUsername, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setIsFollowing((prev) => !prev) // optimistic update
    try {
      await toggleFollow(targetUserId, targetUsername)
    } catch {
      setIsFollowing((prev) => !prev) // revert on error
      toast.error('Failed to update follow. Try again.')
    }
    setLoading(false)
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      className="rounded-full px-5"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
