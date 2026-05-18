import Link from 'next/link'
import TweetCard from './TweetCard'
import type { TweetWithProfile } from '@/types'

type Props = {
  tweets: TweetWithProfile[]
  currentUserId: string
  emptyMessage?: string
  emptyAction?: { label: string; href: string }
  profileUsername?: string
  pinnedTweetId?: string | null
}

export default function TweetList({ tweets, currentUserId, emptyMessage = 'No tweets yet.', emptyAction, profileUsername, pinnedTweetId }: Props) {
  const visibleTweets = pinnedTweetId ? tweets.filter(t => t.id !== pinnedTweetId) : tweets

  if (visibleTweets.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        {emptyAction && (
          <Link href={emptyAction.href} className="text-sm text-primary hover:underline">
            {emptyAction.label}
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul aria-label="Tweets">
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
