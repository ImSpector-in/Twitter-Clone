import TweetCard from './TweetCard'
import type { TweetWithProfile } from '@/types'

type Props = {
  tweets: TweetWithProfile[]
  currentUserId: string
  emptyMessage?: string
}

export default function TweetList({ tweets, currentUserId, emptyMessage = 'No tweets yet.' }: Props) {
  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul>
      {tweets.map((tweet) => (
        <li key={tweet.id}>
          <TweetCard tweet={tweet} currentUserId={currentUserId} />
        </li>
      ))}
    </ul>
  )
}
