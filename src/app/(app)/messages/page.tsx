import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConversations } from '@/lib/queries/messages'
import ConversationList from '@/components/messages/ConversationList'

export const metadata: Metadata = { title: 'Messages · Quotora' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const conversations = await getConversations(user!.id)

  return (
    <div>
      <div className="border-b px-4 py-4 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <ConversationList conversations={conversations} currentUserId={user!.id} />
    </div>
  )
}
