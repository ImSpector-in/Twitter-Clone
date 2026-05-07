import { getAllTweets } from '@/lib/queries/tweets'
import TweetComposer from '@/components/tweet/TweetComposer'
import { formatDistanceToNow } from 'date-fns'

export default async function HomePage() {
  const tweets = await getAllTweets()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Home</h2>
      </div>
      <TweetComposer />
      {tweets.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No tweets yet. Be the first to post!
        </div>
      ) : (
        <ul>
          {tweets.map((tweet) => {
            const profile = Array.isArray(tweet.profiles) ? tweet.profiles[0] : tweet.profiles
            return (
              <li key={tweet.id} className="border-b px-4 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{profile?.display_name || profile?.username}</span>
                  <span className="text-muted-foreground text-sm">@{profile?.username}</span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{tweet.content}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
