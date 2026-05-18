'use client'

import { useState, useMemo, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Repeat2, Users, AtSign } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TweetMenu from './TweetMenu'
import LikeButton from './LikeButton'
import ReplyButton from './ReplyButton'
import RetweetButton from './RetweetButton'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'
import LinkPreviewCard from './LinkPreviewCard'
import { updateTweet } from '@/lib/actions/tweets'
import { renderWithHashtags, LinkFlaggedBanner } from '@/lib/utils/hashtags'
import { getUserGradient } from '@/lib/utils/avatar'
import type { TweetWithProfile } from '@/types'

const URL_RE = /https?:\/\/[^\s<>"']+/

function extractFirstUrl(text: string): string | null {
  const m = text.match(URL_RE)
  return m ? m[0].replace(/[.,!?;:)]+$/, '') : null
}

function safeFromNow(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  try {
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return ''
  }
}

// Module-scope so it's never re-created on render, preserving React.memo boundaries
function stopProp(e: React.MouseEvent) {
  e.stopPropagation()
}

type Props = {
  tweet: TweetWithProfile
  currentUserId: string
  retweetedByUsername?: string
  isPinned?: boolean
  pinnedInProfile?: boolean
  profileUsername?: string
}

function TweetCard({ tweet, currentUserId, retweetedByUsername, isPinned, pinnedInProfile, profileUsername }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(tweet.content)
  const [saving, setSaving] = useState(false)

  async function handleSaveEdit() {
    setSaving(true)
    try {
      await updateTweet(tweet.id, editContent)
      setIsEditing(false)
      toast.success('Tweet updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update tweet.')
    }
    setSaving(false)
  }

  const isRetweet = !!tweet.retweet_of_id && !tweet.content
  const isQuoteTweet = !!tweet.retweet_of_id && !!tweet.content
  const displayTweet = isRetweet && tweet.original ? tweet.original : tweet
  const statsSource = isRetweet && tweet.original ? tweet.original : tweet
  const profile = displayTweet.profiles
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const username = profile?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()
  const gradient = getUserGradient(username)
  const isHot = statsSource.like_count >= 10

  const previewUrl = useMemo(
    () =>
      displayTweet.content && displayTweet.link_status !== 'flagged'
        ? extractFirstUrl(displayTweet.content)
        : null,
    [displayTweet.content, displayTweet.link_status]
  )

  function handleCardClick() {
    router.push(`/tweet/${displayTweet.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className="bg-card border border-border rounded-2xl p-5 hover:border-border/80 hover:bg-card/80 transition-all duration-150 cursor-pointer mb-3"
    >
      {isPinned && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
          <span className="font-medium">Pinned Tweet</span>
        </div>
      )}

      {(isRetweet || retweetedByUsername) && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground" onClick={stopProp}>
          <Repeat2 className="h-3.5 w-3.5 text-green-500" />
          <span className="font-medium">{retweetedByUsername ?? tweet.profiles?.username} retweeted</span>
        </div>
      )}

      <div className="flex gap-3">
        <div onClick={stopProp} className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-semibold text-sm`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/profile/${username}`} onClick={stopProp} className="font-semibold text-[15px] hover:text-primary transition-colors">
              {displayName}
            </Link>
            {profile?.is_admin && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground uppercase tracking-wide leading-none">
                admin
              </span>
            )}
            <span className="text-muted-foreground text-xs">·</span>
            <Link href={`/profile/${username}`} onClick={stopProp} className="text-muted-foreground text-xs hover:text-primary transition-colors">
              @{username}
            </Link>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {safeFromNow(displayTweet.created_at)}
            </span>
            {displayTweet.edited_at && (
              <span className="text-muted-foreground/50 text-xs">(edited)</span>
            )}
            {isHot && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white tracking-wide uppercase">
                Hot
              </span>
            )}
            <span className="ml-auto" onClick={stopProp}>
              <TweetMenu
                tweet={tweet}
                currentUserId={currentUserId}
                profileUsername={profileUsername}
                pinnedInProfile={pinnedInProfile}
                isEditing={isEditing}
                onEditClick={() => setIsEditing(true)}
              />
            </span>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2" onClick={stopProp}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={280}
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-border bg-background text-sm p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">{editContent.length}/280</span>
                <button
                  onClick={() => { setEditContent(tweet.content); setIsEditing(false) }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            displayTweet.content && (
              <>
                <p className="text-base leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                  {renderWithHashtags(displayTweet.content, tweet.link_status)}
                </p>
                {tweet.link_status === 'flagged' && <LinkFlaggedBanner />}
              </>
            )
          )}

          {!isEditing && previewUrl && (
            <div onClick={stopProp}>
              <LinkPreviewCard url={previewUrl} />
            </div>
          )}

          {isQuoteTweet && tweet.original && (
            <div
              onClick={(e) => { e.stopPropagation(); router.push(`/tweet/${tweet.original!.id}`) }}
              className="rounded-xl border border-border p-3 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={tweet.original.profiles?.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className={`bg-gradient-to-br ${getUserGradient(tweet.original.profiles?.username ?? '')} text-white text-[6px]`}>
                    {(tweet.original.profiles?.display_name || tweet.original.profiles?.username || '?').slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-xs">
                  {tweet.original.profiles?.display_name || tweet.original.profiles?.username || 'Unknown'}
                </span>
                <span className="text-muted-foreground text-xs">
                  @{tweet.original.profiles?.username || 'unknown'}
                </span>
                {tweet.original.created_at && (
                  <>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-muted-foreground text-xs">
                      {safeFromNow(tweet.original.created_at)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words line-clamp-4">
                {tweet.original.content}
              </p>
            </div>
          )}

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

          {displayTweet.gif_url && (
            <div onClick={stopProp}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayTweet.gif_url}
                alt="GIF"
                className="rounded-xl max-h-80 w-full object-cover cursor-default border border-border/50"
              />
            </div>
          )}

          {displayTweet.reply_scope && displayTweet.reply_scope !== 'everyone' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {displayTweet.reply_scope === 'followers' ? (
                <>
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>Followers can reply</span>
                </>
              ) : displayTweet.reply_scope === 'mentioned' ? (
                <>
                  <AtSign className="h-3.5 w-3.5 shrink-0" />
                  <span>Mentioned users can reply</span>
                </>
              ) : (
                <>
                  <AtSign className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span>Replies turned off</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1" onClick={stopProp}>
            <div className="flex items-center gap-0.5 -ml-2">
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors duration-150">
                <ReplyButton tweetId={displayTweet.id} replyCount={statsSource.reply_count} />
              </div>
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors duration-150">
                <RetweetButton
                  tweetId={isRetweet ? displayTweet.id : tweet.id}
                  initialRetweeted={statsSource.retweeted_by_me}
                  initialCount={statsSource.retweet_count}
                  quotedTweet={{
                    id: displayTweet.id,
                    content: displayTweet.content,
                    created_at: displayTweet.created_at,
                    profiles: displayTweet.profiles,
                  }}
                />
              </div>
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors duration-150">
                <LikeButton
                  tweetId={isRetweet ? displayTweet.id : tweet.id}
                  initialLiked={statsSource.liked_by_me}
                  initialCount={statsSource.like_count}
                />
              </div>
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-blue-400/10 transition-colors duration-150">
                <ShareButton tweetId={displayTweet.id} />
              </div>
            </div>
            <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-150">
              <BookmarkButton
                tweetId={isRetweet ? displayTweet.id : tweet.id}
                initialBookmarked={statsSource.bookmarked_by_me}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default memo(TweetCard)
