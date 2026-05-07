'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { deleteTweet } from '@/lib/actions/tweets'

export default function DeleteTweetButton({ tweetId }: { tweetId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this tweet?')) return
    setLoading(true)
    try {
      await deleteTweet(tweetId)
    } catch {
      toast.error('Failed to delete tweet.')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive text-xs transition-colors disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
