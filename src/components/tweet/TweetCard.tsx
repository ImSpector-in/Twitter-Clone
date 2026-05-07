import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteTweetButton from './DeleteTweetButton'
import LikeButton from './LikeButton'
import type { TweetWithProfile } from '@/types'

type Props = {
  tweet: TweetWithProfile
  currentUserId: string
}

export default function TweetCard({ tweet, currentUserId }: Props) {
  const profile = tweet.profiles
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const username = profile?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <article className="flex gap-3 border-b px-4 py-3 hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Link href={`/profile/${username}`} className="font-semibold text-sm hover:underline">{displayName}</Link>
          <Link href={`/profile/${username}`} className="text-muted-foreground text-sm hover:underline">@{username}</Link>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{tweet.content}</p>
        <div className="flex items-center gap-4 pt-1">
          <LikeButton
            tweetId={tweet.id}
            initialLiked={tweet.liked_by_me}
            initialCount={tweet.like_count}
          />
          {tweet.user_id === currentUserId && (
            <DeleteTweetButton tweetId={tweet.id} />
          )}
        </div>
      </div>
    </article>
  )
}
