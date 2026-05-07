import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, UserPlus, MessageCircle } from 'lucide-react'
import type { Notification } from '@/types'

export default function NotificationItem({ notification }: { notification: Notification }) {
  const actor = notification.actor
  const displayName = actor?.display_name || actor?.username || 'Someone'
  const username = actor?.username || 'unknown'
  const initials = displayName.slice(0, 2).toUpperCase()

  const icon = {
    like: <Heart className="h-4 w-4 text-red-500 fill-red-500" />,
    follow: <UserPlus className="h-4 w-4 text-blue-500" />,
    reply: <MessageCircle className="h-4 w-4 text-green-500" />,
  }[notification.type]

  const message = {
    like: 'liked your tweet',
    follow: 'followed you',
    reply: 'replied to your tweet',
  }[notification.type]

  const href = notification.tweet_id ? `/tweet/${notification.tweet_id}` : `/profile/${username}`

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 px-4 py-3 border-b hover:bg-muted/30 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={actor?.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{displayName}</span>{' '}
          <span className="text-muted-foreground">{message}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
      )}
    </Link>
  )
}
