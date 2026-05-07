import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getFeedTweets, getAllTweets } from '@/lib/queries/tweets'
import HomeTabs from '@/components/home/HomeTabs'
import TweetList from '@/components/tweet/TweetList'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { tab } = await searchParams
  const isFollowing = tab === 'following'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tweets = isFollowing
    ? await getFeedTweets(user!.id)
    : await getAllTweets(user!.id)

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Home</h2>
      </div>
      <Suspense>
        <HomeTabs />
      </Suspense>
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage={isFollowing ? 'Follow someone to see their tweets here.' : 'No tweets yet.'}
      />
    </div>
  )
}
