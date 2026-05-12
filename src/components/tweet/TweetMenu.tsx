'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Pin, Trash2, UserPlus, UserMinus, VolumeX, Volume2, ShieldBan } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { toggleFollow, getUserRelationship } from '@/lib/actions/follows'
import { muteUser, unmuteUser } from '@/lib/actions/mutes'
import { blockUser, unblockUser } from '@/lib/actions/blocks'
import { pinTweet, unpinTweet } from '@/lib/actions/pin'
import { deleteTweet } from '@/lib/actions/tweets'

type Relationship = { isFollowing: boolean; isMuted: boolean; isBlocked: boolean }

type Props = {
  tweet: any
  currentUserId: string
  profileUsername?: string
  pinnedInProfile?: boolean
  isEditing?: boolean
  onEditClick: () => void
}

export default function TweetMenu({ tweet, currentUserId, profileUsername, pinnedInProfile, isEditing, onEditClick }: Props) {
  const [open, setOpen] = useState(false)
  const [relationship, setRelationship] = useState<Relationship | null>(null)
  const [loading, setLoading] = useState(false)
  const [pinning, setPinning] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isRetweet = !!tweet.retweet_of_id && !tweet.content
  const displayTweet = isRetweet && tweet.original ? tweet.original : tweet
  const targetUserId = displayTweet.user_id
  const targetUsername = displayTweet.profiles?.username ?? 'unknown'

  // Own original/quote tweets → edit/pin/delete
  const showOwnMenu = tweet.user_id === currentUserId && !isRetweet
  // Other people's content visible on the card → follow/mute/block
  const showOtherMenu = !showOwnMenu && targetUserId !== currentUserId

  if (!showOwnMenu && !showOtherMenu) return null

  async function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && showOtherMenu && !relationship) {
      setLoading(true)
      try {
        const rel = await getUserRelationship(targetUserId)
        setRelationship(rel)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleFollow() {
    const wasFollowing = relationship?.isFollowing
    try {
      await toggleFollow(targetUserId, targetUsername)
      setRelationship((prev) => prev ? { ...prev, isFollowing: !prev.isFollowing } : prev)
      toast.success(wasFollowing ? `Unfollowed @${targetUsername}` : `Following @${targetUsername}`)
    } catch (e: any) {
      toast.error(e.message ?? 'Failed')
    }
    setOpen(false)
  }

  async function handleMute() {
    const wasMuted = relationship?.isMuted
    try {
      if (wasMuted) {
        await unmuteUser(targetUserId)
        setRelationship((prev) => prev ? { ...prev, isMuted: false } : prev)
        toast.success(`Unmuted @${targetUsername}`)
      } else {
        await muteUser(targetUserId)
        setRelationship((prev) => prev ? { ...prev, isMuted: true } : prev)
        toast.success(`Muted @${targetUsername}`)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Failed')
    }
    setOpen(false)
  }

  async function handleBlock() {
    const wasBlocked = relationship?.isBlocked
    try {
      if (wasBlocked) {
        await unblockUser(targetUserId)
        setRelationship((prev) => prev ? { ...prev, isBlocked: false } : prev)
        toast.success(`Unblocked @${targetUsername}`)
      } else {
        if (!confirm(`Block @${targetUsername}?`)) return
        await blockUser(targetUserId)
        setRelationship((prev) => prev ? { ...prev, isBlocked: true } : prev)
        toast.success(`Blocked @${targetUsername}`)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Failed')
    }
    setOpen(false)
  }

  async function handlePin() {
    if (!profileUsername) return
    setPinning(true)
    try {
      if (pinnedInProfile) {
        await unpinTweet(profileUsername)
      } else {
        await pinTweet(tweet.id, profileUsername)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update pin.')
    }
    setPinning(false)
    setOpen(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this tweet?')) return
    setDeleting(true)
    try {
      await deleteTweet(tweet.id)
    } catch {
      toast.error('Failed to delete tweet.')
    }
    setDeleting(false)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="w-52">
        {showOwnMenu ? (
          <>
            {!isEditing && (
              <DropdownMenuItem onClick={onEditClick} className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {profileUsername && (
              <DropdownMenuItem onClick={handlePin} disabled={pinning} className="gap-2 cursor-pointer">
                <Pin className="h-4 w-4" />
                {pinnedInProfile ? 'Unpin from profile' : 'Pin to profile'}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </>
        ) : loading ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Loading...
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={handleFollow} className="gap-2 cursor-pointer">
              {relationship?.isFollowing
                ? <UserMinus className="h-4 w-4" />
                : <UserPlus className="h-4 w-4" />}
              {relationship?.isFollowing ? `Unfollow @${targetUsername}` : `Follow @${targetUsername}`}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMute} className="gap-2 cursor-pointer">
              {relationship?.isMuted
                ? <Volume2 className="h-4 w-4" />
                : <VolumeX className="h-4 w-4" />}
              {relationship?.isMuted ? `Unmute @${targetUsername}` : `Mute @${targetUsername}`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleBlock}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <ShieldBan className="h-4 w-4" />
              {relationship?.isBlocked ? `Unblock @${targetUsername}` : `Block @${targetUsername}`}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
