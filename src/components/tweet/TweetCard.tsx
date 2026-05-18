'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

function safeFromNow(dateStr: string | null | undefined, tweetId?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) {
    console.error('[TweetCard] Invalid date:', dateStr, 'tweet:', tweetId)
    return ''
  }
  try {
    return formatDistanceToNow(d, { addSuffix: true })
  } catch (e) {
    console.error('[TweetCard] formatDistanceToNow threw:', e, 'date:', dateStr, 'tweet:', tweetId)
    return ''
  }
}
import { Repeat2, Users, AtSign } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TweetMenu from './TweetMenu'
import LikeButton from './LikeButton'
import ReplyButton from './ReplyButton'
import RetweetButton from './RetweetButton'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'
import { updateTweet } from '@/lib/actions/tweets'
import { renderWithHashtags, LinkFlaggedBanner } from '@/lib/utils/hashtags'
import type { TweetWithProfile } from '@/types'

// ---------------------------------------------------------------------------
// OG link-preview helpers
// ---------------------------------------------------------------------------

type OgData = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  url: string
}

// Module-level cache so the same URL is only fetched once per page load
const ogCache = new Map<string, OgData | null>()

const URL_RE = /https?:\/\/[^\s<>"']+/

function extractFirstUrl(text: string): string | null {
  const m = text.match(URL_RE)
  return m ? m[0].replace(/[.,!?;:)]+$/, '') : null
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function LinkPreviewCard({ url }: { url: string }) {
  const [og, setOg] = useState<OgData | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    if (ogCache.has(url)) {
      setOg(ogCache.get(url) ?? null)
      return
    }

    let cancelled = false
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data: OgData) => {
        if (cancelled) return
        const value = data.title ? data : null
        ogCache.set(url, value)
        setOg(value)
      })
      .catch(() => {
        if (!cancelled) {
          ogCache.set(url, null)
          setOg(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  // Don't render anything while loading or if no useful data
  if (!og) return null

  const domain = getDomain(url)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => e.stopPropagation()}
      className="mt-2 flex items-stretch gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors overflow-hidden no-underline"
    >
      {og.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={og.image}
          alt=""
          className="h-20 w-20 shrink-0 object-cover"
        />
      )}
      <div className="flex flex-col justify-center gap-0.5 py-2.5 pr-3 min-w-0">
        <span className="text-[11px] text-muted-foreground">{domain}</span>
        <span className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
          {og.title}
        </span>
        {og.description && (
          <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {og.description}
          </span>
        )}
      </div>
    </a>
  )
}

// ---------------------------------------------------------------------------
// TweetCard
// ---------------------------------------------------------------------------

type Props = {
  tweet: TweetWithProfile
  currentUserId: string
  retweetedByUsername?: string
  isPinned?: boolean
  pinnedInProfile?: boolean
  profileUsername?: string
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

export default function TweetCard({ tweet, currentUserId, retweetedByUsername, isPinned, pinnedInProfile, profileUsername }: Props) {
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
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update tweet.')
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

  // Extract first URL for link preview (only from non-flagged content)
  const previewUrl =
    displayTweet.content && displayTweet.link_status !== 'flagged'
      ? extractFirstUrl(displayTweet.content)
      : null

  function handleCardClick() {
    router.push(`/tweet/${displayTweet.id}`)
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <article
      onClick={handleCardClick}
      className="bg-card border border-border rounded-2xl p-5 hover:border-border/80 hover:bg-card/80 transition-all duration-150 cursor-pointer mb-3"
    >
      {/* Pinned header */}
      {isPinned && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
          <span className="font-medium">Pinned Tweet</span>
        </div>
      )}

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
              {safeFromNow(displayTweet.created_at, displayTweet.id)}
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

          {/* Content */}
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

          {/* Link preview card — only when not editing and not a flagged link */}
          {!isEditing && previewUrl && (
            <div onClick={stopProp}>
              <LinkPreviewCard url={previewUrl} />
            </div>
          )}

          {/* Embedded quoted tweet */}
          {isQuoteTweet && tweet.original && (
            <div
              onClick={(e) => { e.stopPropagation(); router.push(`/tweet/${tweet.original!.id}`) }}
              className="rounded-xl border border-border p-3 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {tweet.original.profiles?.avatar_url && (
                  <img src={tweet.original.profiles.avatar_url} className="h-4 w-4 rounded-full object-cover" alt="" />
                )}
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
                      {safeFromNow(tweet.original.created_at, tweet.original.id)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words line-clamp-4">
                {tweet.original.content}
              </p>
            </div>
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

          {/* GIF */}
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

          {/* Reply scope indicator — only shown for restricted scopes */}
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
                // 'nobody' or any future closed scope
                <>
                  <AtSign className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span>Replies turned off</span>
                </>
              )}
            </div>
          )}

          {/* Action bar — left cluster + bookmark on right like Hivit */}
          <div className="flex items-center justify-between pt-1" onClick={stopProp}>
            {/* Left: reply, retweet, like, share */}
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
            {/* Right: bookmark separated like Hivit */}
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
