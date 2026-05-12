import TweetCard from './TweetCard'
import type { TweetWithProfile } from '@/types'

type Props = {
  tweets: TweetWithProfile[]
  currentUserId: string
  emptyMessage?: string
  profileUsername?: string
  pinnedTweetId?: string | null
}

export default function TweetList({ tweets, currentUserId, emptyMessage = 'No tweets yet.', profileUsername, pinnedTweetId }: Props) {
  const visibleTweets = pinnedTweetId ? tweets.filter(t => t.id !== pinnedTweetId) : tweets

  if (visibleTweets.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul>
      {visibleTweets.map((tweet) => (
        <li key={tweet.id}>
          <TweetCard
            tweet={tweet}
            currentUserId={currentUserId}
            profileUsername={profileUsername}
            pinnedInProfile={false}
          />
        </li>
      ))}
    </ul>
  )
}
