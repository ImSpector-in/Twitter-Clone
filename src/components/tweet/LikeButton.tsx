'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { toggleLike } from '@/lib/actions/likes'

type Props = {
  tweetId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ tweetId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  async function handleClick() {
    setLiked((prev) => !prev)
    setCount((prev) => liked ? prev - 1 : prev + 1)
    try {
      await toggleLike(tweetId)
    } catch {
      setLiked((prev) => !prev)
      setCount((prev) => liked ? prev + 1 : prev - 1)
      toast.error('Failed to like. Try again.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs transition-colors hover:text-red-500 ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
