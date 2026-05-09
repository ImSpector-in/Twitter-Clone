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

const GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-green-600',
  'from-blue-400 to-indigo-600',
  'from-fuchsia-400 to-pink-600',
]

function getUserGradient(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function TweetCard({ tweet, currentUserId, retweetedByUsername }: Props) {
  const router = useRouter()

  const isRetweet = !!tweet.retweet_of_id && !tweet.content
  const displayTweet = isRetweet && tweet.original ? tweet.original : tweet
  const profile = displayTweet.profiles
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const username = profile?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()
  const gradient = getUserGradient(username)
  const isHot = tweet.like_count >= 10

  function handleCardClick() {
    router.push(`/tweet/${displayTweet.id}`)
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <article
      onClick={handleCardClick}
      className="bg-card border border-border rounded-2xl p-4 hover:border-border/80 hover:bg-card/80 transition-all duration-150 cursor-pointer mb-3"
    >
      {/* Retweet header */}
      {(isRetweet || retweetedByUsername) && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground" onClick={stopProp}>
          <Repeat2 className="h-3.5 w-3.5 text-green-500" />
          <span className="font-medium">{retweetedByUsername ?? tweet.profiles?.username} retweeted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div onClick={stopProp} className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-semibold text-sm`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${username}`} onClick={stopProp} className="font-semibold text-sm hover:text-primary transition-colors">
              {displayName}
            </Link>
            <span className="text-muted-foreground text-xs">·</span>
            <Link href={`/profile/${username}`} onClick={stopProp} className="text-muted-foreground text-xs hover:text-primary transition-colors">
              @{username}
            </Link>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {formatDistanceToNow(new Date(displayTweet.created_at), { addSuffix: true })}
            </span>
            {isHot && (
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white tracking-wide uppercase">
                Hot
              </span>
            )}
          </div>

          {/* Content */}
          {displayTweet.content && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
              {displayTweet.content}
            </p>
          )}

          {/* Image */}
          {displayTweet.image_url && (
            <div onClick={stopProp}>
              <Image
                src={displayTweet.image_url}
                alt="Tweet image"
                width={500}
                height={300}
                className="rounded-xl object-cover max-h-80 w-full cursor-default border border-border/50"
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 pt-1 -ml-2" onClick={stopProp}>
            <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors duration-150">
              <ReplyButton tweetId={displayTweet.id} replyCount={tweet.reply_count} />
            </div>
            <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors duration-150">
              <RetweetButton
                tweetId={isRetweet ? displayTweet.id : tweet.id}
                initialRetweeted={tweet.retweeted_by_me}
                initialCount={tweet.retweet_count}
              />
            </div>
            <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors duration-150">
              <LikeButton
                tweetId={isRetweet ? displayTweet.id : tweet.id}
                initialLiked={tweet.liked_by_me}
                initialCount={tweet.like_count}
              />
            </div>
            <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-150">
              <BookmarkButton
                tweetId={isRetweet ? displayTweet.id : tweet.id}
                initialBookmarked={tweet.bookmarked_by_me}
              />
            </div>
            {(isRetweet ? displayTweet.user_id : tweet.user_id) === currentUserId && (
              <div className="px-2 py-1.5">
                <DeleteTweetButton tweetId={tweet.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
