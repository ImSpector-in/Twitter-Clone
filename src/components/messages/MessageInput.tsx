'use client'

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { sendMessage } from '@/lib/actions/messages'
import type { MessageRow } from '@/lib/queries/messages'

type Props = {
  conversationId: string
  currentUserId: string
  currentUserProfile: { username: string; displayName: string | null; avatarUrl: string | null }
  onOptimistic: (msg: MessageRow & { pending: true }) => void
}

export default function MessageInput({ conversationId, currentUserId, currentUserProfile, onOptimistic }: Props) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    const clientId = crypto.randomUUID()

    // Immediately show optimistic message
    onOptimistic({
      id: clientId,
      conversationId,
      senderId: currentUserId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      senderProfile: currentUserProfile,
      pending: true,
    })

    setContent('')
    textareaRef.current?.focus()
    setSending(true)

    try {
      await sendMessage(conversationId, trimmed, clientId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const remaining = 1000 - content.length

  return (
    <div className="border-t border-border px-4 py-3 bg-background">
      <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[24px] max-h-32 py-1 placeholder:text-muted-foreground"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = `${Math.min(t.scrollHeight, 128)}px`
          }}
        />
        <div className="flex items-center gap-2 pb-1 shrink-0">
          {content.length > 900 && (
            <span className={`text-xs tabular-nums ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remaining}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending || remaining < 0}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
