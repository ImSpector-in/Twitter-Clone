import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare } from 'lucide-react'
import type { ConversationItem } from '@/lib/queries/messages'

function getUserGradient(username: string) {
  const GRADIENTS = [
    'from-teal-400 to-cyan-600', 'from-pink-400 to-rose-600',
    'from-violet-400 to-purple-600', 'from-amber-400 to-orange-600',
    'from-emerald-400 to-green-600', 'from-blue-400 to-indigo-600',
  ]
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function ConversationList({ conversations, currentUserId }: {
  conversations: ConversationItem[]
  currentUserId: string
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-semibold text-lg">No messages yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Start a conversation by visiting someone&apos;s profile and clicking Message.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {conversations.map((conv) => {
        const { otherUser, lastMessage, hasUnread } = conv
        const displayName = otherUser.displayName || otherUser.username
        const initials = displayName.slice(0, 2).toUpperCase()
        const gradient = getUserGradient(otherUser.username)
        const preview = lastMessage
          ? lastMessage.senderId === currentUserId
            ? `You: ${lastMessage.content}`
            : lastMessage.content
          : 'No messages yet'

        return (
          <li key={conv.id}>
            <Link
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.avatarUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-semibold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {hasUnread && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[15px] truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>
                    {displayName}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${hasUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {preview.length > 60 ? preview.slice(0, 60) + '…' : preview}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
