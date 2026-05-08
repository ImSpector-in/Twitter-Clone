import { createClient } from '@/lib/supabase/server'
import { attachLikedBy } from '@/lib/queries/tweets'
import TweetList from '@/components/tweet/TweetList'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('bookmarks')
    .select(`
      tweets (
        id, content, created_at, user_id, reply_to_id, retweet_of_id, image_url,
        profiles!tweets_user_id_fkey (username, display_name, avatar_url),
        likes (count),
        replies:tweets!reply_to_id (count),
        retweets:tweets!retweet_of_id (count)
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const rawTweets = data?.map((b: any) => b.tweets).filter(Boolean) ?? []
  const tweets = await attachLikedBy(rawTweets, user!.id)

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Bookmarks</h2>
        <p className="text-muted-foreground text-sm">Tweets you&apos;ve saved</p>
      </div>
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage="No bookmarks yet. Tap the bookmark icon on any tweet to save it."
      />
    </div>
  )
}
