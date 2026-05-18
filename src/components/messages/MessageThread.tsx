'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { markConversationRead, deleteMessage } from '@/lib/actions/messages'
import { getUserGradient } from '@/lib/utils/avatar'
import MessageInput from './MessageInput'
import type { MessageRow } from '@/lib/queries/messages'

type DisplayMessage = MessageRow & { pending?: boolean }

type Props = {
  conversationId: string
  initialMessages: MessageRow[]
  currentUserId: string
  currentUserProfile: { username: string; displayName: string | null; avatarUrl: string | null }
  otherUserProfile: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
}

export default function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  currentUserProfile,
  otherUserProfile,
}: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  const markRead = useCallback(async () => {
    await markConversationRead(conversationId)
  }, [conversationId])

  // Mark as read on mount
  useEffect(() => {
    markRead()
  }, [markRead])

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription — filtered to this conversation only
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as {
            id: string
            conversation_id: string
            sender_id: string
            content: string
            created_at: string
            deleted_at: string | null
          }

          if (raw.deleted_at) return

          const isMe = raw.sender_id === currentUserId
          const senderProfile = isMe
            ? currentUserProfile
            : { username: otherUserProfile.username, displayName: otherUserProfile.displayName, avatarUrl: otherUserProfile.avatarUrl }

          setMessages((prev) => {
            if (prev.some((m) => m.id === raw.id)) {
              return prev.map((m) =>
                m.id === raw.id ? { ...m, pending: false } : m
              )
            }
            return [
              ...prev,
              {
                id: raw.id,
                conversationId: raw.conversation_id,
                senderId: raw.sender_id,
                content: raw.content,
                createdAt: raw.created_at,
                senderProfile,
              },
            ]
          })

          if (!isMe) markRead()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, currentUserProfile, otherUserProfile, markRead])

  function handleOptimistic(msg: DisplayMessage & { pending: true }) {
    setMessages((prev) => [...prev, msg])
  }

  async function handleDelete(messageId: string) {
    try {
      await deleteMessage(messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete message')
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-14 md:pb-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          const profile = msg.senderProfile
          const displayName = profile?.displayName || profile?.username || 'Unknown'
          const initials = displayName.slice(0, 2).toUpperCase()
          const gradient = getUserGradient(profile?.username ?? '')

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isMe && (
                <Avatar className="h-8 w-8 shrink-0 mb-0.5">
                  <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-xs font-semibold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
                    ${isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                    }
                    ${msg.pending ? 'opacity-60' : 'opacity-100'}
                  `}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {msg.pending
                      ? 'Sending…'
                      : formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                  {isMe && !msg.pending && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      aria-label="Delete message"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        currentUserId={currentUserId}
        currentUserProfile={currentUserProfile}
        onOptimistic={handleOptimistic}
      />
    </div>
  )
}
