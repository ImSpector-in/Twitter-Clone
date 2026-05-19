'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, UserPlus, UserCheck, MessageCircle, AtSign } from 'lucide-react'
import { toast } from 'sonner'
import { approveFollowRequest, denyFollowRequest } from '@/lib/actions/follows'
import type { Notification } from '@/types'

type Props = {
  notification: Notification
  onHandled?: (notificationId: string) => void
}

const ICON: Record<string, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-500 fill-red-500" />,
  follow: <UserPlus className="h-4 w-4 text-blue-500" />,
  reply: <MessageCircle className="h-4 w-4 text-green-500" />,
  mention: <AtSign className="h-4 w-4 text-purple-500" />,
  follow_request: <UserPlus className="h-4 w-4 text-orange-500" />,
  follow_request_accepted: <UserCheck className="h-4 w-4 text-blue-500" />,
}

const MESSAGE: Record<string, string> = {
  like: 'liked your tweet',
  follow: 'followed you',
  reply: 'replied to your tweet',
  mention: 'mentioned you',
  follow_request: 'requested to follow you',
  follow_request_accepted: 'accepted your follow request',
}

export default function NotificationItem({ notification, onHandled }: Props) {
  const [loading, setLoading] = useState(false)
  const actor = notification.actor
  const displayName = actor?.display_name || actor?.username || 'Someone'
  const username = actor?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()
  const isFollowRequest = notification.type === 'follow_request'
  const href = notification.tweet_id ? `/tweet/${notification.tweet_id}` : `/profile/${username}`

  async function handleApprove() {
    setLoading(true)
    try {
      await approveFollowRequest(notification.actor_id, username)
      onHandled?.(notification.id)
      toast.success(`${displayName} is now following you.`)
    } catch {
      toast.error('Failed to approve request.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeny() {
    setLoading(true)
    try {
      await denyFollowRequest(notification.actor_id)
      onHandled?.(notification.id)
    } catch {
      toast.error('Failed to deny request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
      } ${!isFollowRequest ? 'hover:bg-muted/30' : ''}`}
    >
      <Link href={href} className="flex items-start gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={actor?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" aria-hidden="true">
            {ICON[notification.type]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{displayName}</span>{' '}
            <span className="text-muted-foreground">{MESSAGE[notification.type]}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {isFollowRequest && (
          <>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={loading}
              className="rounded-full px-3 h-8"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeny}
              disabled={loading}
              className="rounded-full px-3 h-8"
            >
              Deny
            </Button>
          </>
        )}
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread">
            <span className="sr-only">Unread notification</span>
          </div>
        )}
      </div>
    </div>
  )
}
