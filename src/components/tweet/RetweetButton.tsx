'use client'

import { useState } from 'react'
import { Repeat2 } from 'lucide-react'
import { toast } from 'sonner'
import { retweet } from '@/lib/actions/retweets'

export default function RetweetButton({ tweetId, initialRetweeted, initialCount }: {
  tweetId: string
  initialRetweeted: boolean
  initialCount: number
}) {
  const [retweeted, setRetweeted] = useState(initialRetweeted)
  const [count, setCount] = useState(initialCount)

  async function handleClick() {
    setRetweeted((prev) => !prev)
    setCount((prev) => retweeted ? prev - 1 : prev + 1)
    try {
      await retweet(tweetId)
    } catch {
      setRetweeted((prev) => !prev)
      setCount((prev) => retweeted ? prev + 1 : prev - 1)
      toast.error('Failed to retweet.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs transition-colors group-hover:text-green-500 tabular-nums ${retweeted ? 'text-green-500' : 'text-muted-foreground'}`}
    >
      <Repeat2 className="h-4 w-4" />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
