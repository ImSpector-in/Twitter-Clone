'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { blockUser, unblockUser } from '@/lib/actions/blocks'
import { muteUser, unmuteUser } from '@/lib/actions/mutes'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Ban, VolumeX } from 'lucide-react'

type Props = {
  targetId: string
  targetUsername: string
  initialBlocked: boolean
  initialMuted: boolean
}

export default function BlockMuteButtons({ targetId, targetUsername, initialBlocked, initialMuted }: Props) {
  const [blocked, setBlocked] = useState(initialBlocked)
  const [muted, setMuted] = useState(initialMuted)

  async function handleBlock() {
    try {
      if (blocked) {
        await unblockUser(targetId)
        setBlocked(false)
        toast.success(`Unblocked @${targetUsername}`)
      } else {
        await blockUser(targetId)
        setBlocked(true)
        toast.success(`Blocked @${targetUsername}`)
      }
    } catch {
      toast.error('Failed to update block.')
    }
  }

  async function handleMute() {
    try {
      if (muted) {
        await unmuteUser(targetId)
        setMuted(false)
        toast.success(`Unmuted @${targetUsername}`)
      } else {
        await muteUser(targetId)
        setMuted(true)
        toast.success(`Muted @${targetUsername}`)
      }
    } catch {
      toast.error('Failed to update mute.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full px-2">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMute} className="gap-2">
          <VolumeX className="h-4 w-4" />
          {muted ? `Unmute @${targetUsername}` : `Mute @${targetUsername}`}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlock} className="gap-2 text-destructive focus:text-destructive">
          <Ban className="h-4 w-4" />
          {blocked ? `Unblock @${targetUsername}` : `Block @${targetUsername}`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
