'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Repeat2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteTweetButton from './DeleteTweetButton'
import LikeButton from './LikeButton'
import ReplyButton from './ReplyButton'
import RetweetButton from './RetweetButton'
import BookmarkButton from './BookmarkButton'
import type { TweetWithProfile } from '@/types'

type Props = {
  tweet: TweetWithProfile
  currentUserId: string
  retweetedByUsername?: string
}

export default function TweetCard({ tweet, currentUserId, retweetedByUsername }: Props) {
  const router = useRouter()

  // If this is a pure retweet (no content), show the original tweet
  const isRetweet = !!tweet.retweet_of_id && !tweet.content
  const displayTweet = isRetweet && tweet.original ? tweet.original : tweet
  const profile = displayTweet.profiles
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const username = profile?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()

  function handleCardClick() {
    router.push(`/tweet/${displayTweet.id}`)
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <article
      onClick={handleCardClick}
      className="flex flex-col border-b hover:bg-muted/30 transition-colors cursor-pointer"
    >
      {/* Retweet header */}
      {(isRetweet || retweetedByUsername) && (
        <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted-foreground" onClick={stopProp}>
          <Repeat2 className="h-3.5 w-3.5" />
          <span>{retweetedByUsername ?? tweet.profiles?.username} retweeted</span>
        </div>
      )}

      <div className="flex gap-3 px-4 py-3">
        <div onClick={stopProp}>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Link href={`/profile/${username}`} onClick={stopProp} className="font-semibold text-sm hover:underline">{displayName}</Link>
            <Link href={`/profile/${username}`} onClick={stopProp} className="text-muted-foreground text-sm hover:underline">@{username}</Link>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(displayTweet.created_at), { addSuffix: true })}
            </span>
          </div>
          {displayTweet.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{displayTweet.content}</p>
          )}
          {displayTweet.image_url && (
            <div onClick={stopProp} className="mt-2">
              <Image
                src={displayTweet.image_url}
                alt="Tweet image"
                width={500}
                height={300}
                className="rounded-xl object-cover max-h-80 w-full cursor-default"
              />
            </div>
          )}
          <div className="flex items-center gap-4 pt-1" onClick={stopProp}>
            <ReplyButton tweetId={displayTweet.id} replyCount={tweet.reply_count} />
            <RetweetButton
              tweetId={isRetweet ? displayTweet.id : tweet.id}
              initialRetweeted={tweet.retweeted_by_me}
              initialCount={tweet.retweet_count}
            />
            <LikeButton
              tweetId={isRetweet ? displayTweet.id : tweet.id}
              initialLiked={tweet.liked_by_me}
              initialCount={tweet.like_count}
            />
            <BookmarkButton
              tweetId={isRetweet ? displayTweet.id : tweet.id}
              initialBookmarked={tweet.bookmarked_by_me}
            />
            {(isRetweet ? displayTweet.user_id : tweet.user_id) === currentUserId && (
              <DeleteTweetButton tweetId={tweet.id} />
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
