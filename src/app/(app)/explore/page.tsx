import { createClient } from '@/lib/supabase/server'
import { getAllTweets } from '@/lib/queries/tweets'
import TweetList from '@/components/tweet/TweetList'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tweets = await getAllTweets()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Explore</h2>
        <p className="text-muted-foreground text-sm">All tweets from everyone</p>
      </div>
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage="No tweets yet."
      />
    </div>
  )
}
