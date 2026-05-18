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
      aria-label={liked ? `Unlike (${count})` : `Like (${count})`}
      aria-pressed={liked}
      className={`flex items-center gap-1 text-xs transition-colors group-hover:text-rose-500 tabular-nums ${liked ? 'text-rose-500' : 'text-muted-foreground'}`}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500' : ''}`} />
      {count > 0 && <span aria-hidden="true">{count}</span>}
    </button>
  )
}
