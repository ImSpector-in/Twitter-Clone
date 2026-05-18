'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import TweetCard from '@/components/tweet/TweetCard'
import TweetSkeleton from '@/components/tweet/TweetSkeleton'
import type { TweetWithProfile } from '@/types'

type Props = {
  initialTweets: TweetWithProfile[]
  initialCursor: string | null
  currentUserId: string
  feedType: 'for-you' | 'following'
  emptyMessage?: string
}

export default function FeedInfiniteScroll({
  initialTweets,
  initialCursor,
  currentUserId,
  feedType,
  emptyMessage = 'No tweets yet.',
}: Props) {
  const [tweets, setTweets] = useState<TweetWithProfile[]>(initialTweets)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialCursor !== null)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Track the feed type so we can reset state when the tab changes
  const feedTypeRef = useRef(feedType)

  // When the parent switches tabs (feedType prop changes), reset everything
  useEffect(() => {
    if (feedTypeRef.current !== feedType) {
      feedTypeRef.current = feedType
      setTweets(initialTweets)
      setCursor(initialCursor)
      setHasMore(initialCursor !== null)
    }
  }, [feedType, initialTweets, initialCursor])

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
      const endpoint = feedType === 'following'
        ? `/api/feed/following${params}`
        : `/api/feed/for-you${params}`

      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to fetch')
      const { tweets: newTweets, nextCursor } = await res.json()

      setTweets((prev) => [...prev, ...(newTweets as TweetWithProfile[])])
      setCursor(nextCursor)
      setHasMore(nextCursor !== null)
    } catch {
      // Silently fail — the sentinel will retry on next intersection
    } finally {
      setLoading(false)
    }
  }, [cursor, feedType, hasMore, loading])

  // Set up IntersectionObserver on the sentinel div
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore()
        }
      },
      { rootMargin: '200px' } // Start loading 200px before the sentinel enters view
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchMore])

  if (tweets.length === 0 && !loading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      <ul>
        {tweets.map((tweet) => (
          <li key={tweet.id}>
            <TweetCard
              tweet={tweet}
              currentUserId={currentUserId}
            />
          </li>
        ))}
      </ul>

      {/* Sentinel element — the IntersectionObserver watches this */}
      <div ref={sentinelRef} />

      {loading && (
        <div>
          <TweetSkeleton />
          <TweetSkeleton />
        </div>
      )}

      {!hasMore && tweets.length > 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          You&apos;re all caught up
        </p>
      )}
    </div>
  )
}
