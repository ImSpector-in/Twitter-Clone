'use client'

import { useTransition } from 'react'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { startConversation } from '@/lib/actions/messages'

export default function MessageButton({ targetUserId }: { targetUserId: string }) {
  const [pending, start] = useTransition()

  function handleClick() {
    start(async () => {
      try {
        await startConversation(targetUserId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not start conversation')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-2 text-sm border border-border rounded-full px-4 py-1.5 font-semibold hover:bg-muted/50 transition-colors disabled:opacity-50"
    >
      <MessageSquare className="h-4 w-4" />
      {pending ? '…' : 'Message'}
    </button>
  )
}
