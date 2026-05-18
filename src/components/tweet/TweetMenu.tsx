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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { toggleFollow, getUserRelationship } from '@/lib/actions/follows'
import { muteUser, unmuteUser } from '@/lib/actions/mutes'
import { blockUser, unblockUser } from '@/lib/actions/blocks'
import { pinTweet, unpinTweet } from '@/lib/actions/pin'
import { deleteTweet } from '@/lib/actions/tweets'
import type { TweetWithProfile } from '@/types'

type Relationship = { isFollowing: boolean; isMuted: boolean; isBlocked: boolean }

type Props = {
  tweet: TweetWithProfile
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
  const [pendingDelete, setPendingDelete] = useState(false)
  const [pendingBlock, setPendingBlock] = useState(false)

  const isRetweet = !!tweet.retweet_of_id && !tweet.content
  const displayTweet = isRetweet && tweet.original ? tweet.original : tweet
  const targetUserId = displayTweet.user_id
  const targetUsername = displayTweet.profiles?.username ?? 'unknown'

  const showOwnMenu = tweet.user_id === currentUserId && !isRetweet
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
    setOpen(false)
  }

  function handleBlockClick() {
    const wasBlocked = relationship?.isBlocked
    if (wasBlocked) {
      void handleUnblock()
      return
    }
    setOpen(false)
    setPendingBlock(true)
  }

  async function handleUnblock() {
    try {
      await unblockUser(targetUserId)
      setRelationship((prev) => prev ? { ...prev, isBlocked: false } : prev)
      toast.success(`Unblocked @${targetUsername}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
    setOpen(false)
  }

  async function confirmBlock() {
    setPendingBlock(false)
    try {
      await blockUser(targetUserId)
      setRelationship((prev) => prev ? { ...prev, isBlocked: true } : prev)
      toast.success(`Blocked @${targetUsername}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update pin.')
    }
    setPinning(false)
    setOpen(false)
  }

  function handleDeleteClick() {
    setOpen(false)
    setPendingDelete(true)
  }

  async function confirmDelete() {
    setPendingDelete(false)
    setDeleting(true)
    try {
      await deleteTweet(tweet.id)
    } catch {
      toast.error('Failed to delete tweet.')
    }
    setDeleting(false)
  }

  return (
    <>
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
                onClick={handleDeleteClick}
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
                onClick={handleBlockClick}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <ShieldBan className="h-4 w-4" />
                {relationship?.isBlocked ? `Unblock @${targetUsername}` : `Block @${targetUsername}`}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pendingDelete} onOpenChange={setPendingDelete}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete tweet?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingBlock} onOpenChange={setPendingBlock}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Block @{targetUsername}?</DialogTitle>
            <DialogDescription>They won&apos;t be able to see your tweets or interact with you.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingBlock(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBlock}>Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
