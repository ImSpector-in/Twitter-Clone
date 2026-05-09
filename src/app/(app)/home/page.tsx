import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getFeedTweets, getAllTweets } from '@/lib/queries/tweets'
import HomeTabs from '@/components/home/HomeTabs'
import TweetList from '@/components/tweet/TweetList'
import HomeComposer from '@/components/tweet/HomeComposer'
import { TweetListSkeleton } from '@/components/tweet/TweetSkeleton'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

async function Feed({ userId, isFollowing }: { userId: string; isFollowing: boolean }) {
  const tweets = isFollowing
    ? await getFeedTweets(userId)
    : await getAllTweets(userId)

  return (
    <TweetList
      tweets={tweets as any}
      currentUserId={userId}
      emptyMessage={isFollowing ? 'Follow someone to see their tweets here.' : 'No tweets yet.'}
    />
  )
}

export default async function HomePage({ searchParams }: Props) {
  const { tab } = await searchParams
  const isFollowing = tab === 'following'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      {/* Hivit-style compact composer */}
      <HomeComposer />

      {/* For You / Following tabs */}
      <Suspense>
        <HomeTabs />
      </Suspense>

      <Suspense fallback={<TweetListSkeleton />}>
        <Feed userId={user!.id} isFollowing={isFollowing} />
      </Suspense>
    </div>
  )
}
