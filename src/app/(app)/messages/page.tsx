import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConversations } from '@/lib/queries/messages'
import ConversationList from '@/components/messages/ConversationList'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const conversations = await getConversations(user!.id)

  return (
    <div>
      <div className="border-b px-4 py-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <ConversationList conversations={conversations} currentUserId={user!.id} />
    </div>
  )
}
