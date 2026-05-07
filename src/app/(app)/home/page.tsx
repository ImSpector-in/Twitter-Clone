import { createClient } from '@/lib/supabase/server'
import { getAllTweets } from '@/lib/queries/tweets'
import TweetComposer from '@/components/tweet/TweetComposer'
import TweetList from '@/components/tweet/TweetList'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tweets = await getAllTweets()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Home</h2>
      </div>
      <TweetComposer />
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage="No tweets yet — be the first to post!"
      />
    </div>
  )
}
