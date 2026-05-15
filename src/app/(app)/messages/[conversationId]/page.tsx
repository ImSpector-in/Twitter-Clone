import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMessages, getConversationParticipants } from '@/lib/queries/messages'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MessageThread from '@/components/messages/MessageThread'

type Props = { params: Promise<{ conversationId: string }> }

const GRADIENTS = [
  'from-teal-400 to-cyan-600', 'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600', 'from-amber-400 to-orange-600',
]

function getGradient(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch messages — returns null if user is not a participant (BOLA protection)
  const messages = await getMessages(conversationId, user!.id)
  if (messages === null) notFound()

  // Get participant profiles
  const participants = await getConversationParticipants(conversationId, user!.id)
  const otherParticipant = participants.find((p) => p.userId !== user!.id)
  if (!otherParticipant?.profile) notFound()

  // Current user's profile for display
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user!.id)
    .single()

  const other = otherParticipant.profile as any
  const otherDisplayName = other.display_name || other.username
  const otherInitials = otherDisplayName.slice(0, 2).toUpperCase()
  const gradient = getGradient(other.username)

  return (
    // Cancel the outer layout's pt-4 / pb-20 padding so this page fills the viewport exactly.
    // h-[calc(100dvh-3.5rem)] = full dynamic viewport height minus the sticky TopNav (h-14).
    <div className="-mt-4 -mb-20 md:-mb-4 flex flex-col overflow-hidden h-[calc(100dvh-3.5rem)]">
      {/* Thread header */}
      <div className="border-b px-4 py-3 flex items-center gap-3 bg-background z-10 shrink-0">
        <Link href="/messages" className="p-1 rounded-full hover:bg-muted transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link href={`/profile/${other.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-sm font-semibold`}>
              {otherInitials}
            </AvatarFallback>
            <AvatarImage src={other.avatar_url ?? undefined} alt={otherDisplayName} />
          </Avatar>
          <div>
            <p className="font-semibold text-[15px] leading-none">{otherDisplayName}</p>
            <p className="text-muted-foreground text-xs">@{other.username}</p>
          </div>
        </Link>
      </div>

      {/* Realtime message thread */}
      <MessageThread
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={user!.id}
        currentUserProfile={{
          username: myProfile?.username ?? '',
          displayName: myProfile?.display_name ?? null,
          avatarUrl: myProfile?.avatar_url ?? null,
        }}
        otherUserProfile={{
          id: other.id,
          username: other.username,
          displayName: other.display_name ?? null,
          avatarUrl: other.avatar_url ?? null,
        }}
      />
    </div>
  )
}
