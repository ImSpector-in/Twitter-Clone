import { createClient } from '@/lib/supabase/server'

export type ConversationItem = {
  id: string
  lastMessageAt: string
  hasUnread: boolean
  otherUser: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  lastMessage: {
    content: string
    senderId: string
    createdAt: string
  } | null
}

export type MessageRow = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  senderProfile: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  } | null
}

export async function getConversations(userId: string): Promise<ConversationItem[]> {
  const supabase = await createClient()

  const { data: myParts } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (!myParts || myParts.length === 0) return []

  const convIds = myParts.map((p) => p.conversation_id)
  const myReadAt = new Map(myParts.map((p) => [p.conversation_id, p.last_read_at]))

  const { data: convs } = await supabase
    .from('conversations')
    .select('id, last_message_at')
    .in('id', convIds)
    .order('last_message_at', { ascending: false })
    .limit(50)

  if (!convs || convs.length === 0) return []

  const activeConvIds = convs.map((c) => c.id)

  const { data: others } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, profiles!conversation_participants_user_id_fkey(id, username, display_name, avatar_url)')
    .in('conversation_id', activeConvIds)
    .neq('user_id', userId)

  const otherByConv = new Map<string, unknown>()
  for (const o of others ?? []) otherByConv.set(o.conversation_id, o.profiles)

  // Fetch one message per conversation using DISTINCT ON equivalent:
  // get recent messages and take the first per conversation in JS (bounded by 50 convs)
  const { data: latestMsgs } = await supabase
    .from('messages')
    .select('conversation_id, content, sender_id, created_at')
    .in('conversation_id', activeConvIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(activeConvIds.length * 3)

  const lastMsgByConv = new Map<string, { content: string; sender_id: string; created_at: string }>()
  for (const msg of latestMsgs ?? []) {
    if (!lastMsgByConv.has(msg.conversation_id)) lastMsgByConv.set(msg.conversation_id, msg)
  }

  return convs.map((conv) => {
    const other = otherByConv.get(conv.id) as { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
    const lastMsg = lastMsgByConv.get(conv.id)
    const readAt = myReadAt.get(conv.id)
    const hasUnread = !readAt ? !!lastMsg : !!(lastMsg && new Date(lastMsg.created_at) > new Date(readAt))

    return {
      id: conv.id,
      lastMessageAt: conv.last_message_at,
      hasUnread,
      otherUser: {
        id: other?.id ?? '',
        username: other?.username ?? 'unknown',
        displayName: other?.display_name ?? null,
        avatarUrl: other?.avatar_url ?? null,
      },
      lastMessage: lastMsg
        ? { content: lastMsg.content, senderId: lastMsg.sender_id, createdAt: lastMsg.created_at }
        : null,
    }
  })
}

export async function getMessages(conversationId: string, userId: string): Promise<MessageRow[] | null> {
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!membership) return null

  const { data } = await supabase
    .from('messages')
    .select(`
      id, conversation_id, sender_id, content, created_at,
      profiles!messages_sender_id_fkey (username, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(100)

  return ((data ?? []) as unknown[]).map((m: unknown) => {
    const msg = m as { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; profiles: { username: string; display_name: string | null; avatar_url: string | null } | null }
    return {
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      senderProfile: msg.profiles
        ? { username: msg.profiles.username, displayName: msg.profiles.display_name, avatarUrl: msg.profiles.avatar_url }
        : null,
    }
  })
}

export async function getConversationParticipants(
  conversationId: string,
  _userId: string
): Promise<ConversationParticipant[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('conversation_participants')
    .select('user_id, profiles!conversation_participants_user_id_fkey(id, username, display_name, avatar_url)')
    .eq('conversation_id', conversationId)

  return ((data ?? []) as unknown[]).map((p: unknown) => {
    const row = p as { user_id: string; profiles: ParticipantProfile | null }
    return { userId: row.user_id, profile: row.profiles ?? null }
  })
}

export async function getUnreadDmCount(_userId: string): Promise<number> {
  const supabase = await createClient()
  // The RPC uses auth.uid() internally (no parameter) — prevents IDOR
  const { data, error } = await supabase.rpc('get_unread_dm_count')
  if (error) return 0
  return (data as number) ?? 0
}

export type ParticipantProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type ConversationParticipant = {
  userId: string
  profile: ParticipantProfile | null
}
