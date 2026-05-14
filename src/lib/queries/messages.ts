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

  // 1. My participations + last_read_at
  const { data: myParts } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (!myParts || myParts.length === 0) return []

  const convIds = myParts.map((p) => p.conversation_id)
  const myReadAt = new Map(myParts.map((p) => [p.conversation_id, p.last_read_at]))

  // 2. Conversations sorted by recency
  const { data: convs } = await supabase
    .from('conversations')
    .select('id, last_message_at')
    .in('id', convIds)
    .order('last_message_at', { ascending: false })

  if (!convs || convs.length === 0) return []

  // 3. Other participants' profiles (not me)
  const { data: others } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, profiles!conversation_participants_user_id_fkey(id, username, display_name, avatar_url)')
    .in('conversation_id', convIds)
    .neq('user_id', userId)

  const otherByConv = new Map<string, any>()
  for (const o of others ?? []) otherByConv.set(o.conversation_id, o.profiles)

  // 4. Latest messages across all conversations (pick first per convo in JS)
  const { data: latestMsgs } = await supabase
    .from('messages')
    .select('conversation_id, content, sender_id, created_at')
    .in('conversation_id', convIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(convIds.length * 5)

  const lastMsgByConv = new Map<string, any>()
  for (const msg of latestMsgs ?? []) {
    if (!lastMsgByConv.has(msg.conversation_id)) lastMsgByConv.set(msg.conversation_id, msg)
  }

  return convs.map((conv) => {
    const other = otherByConv.get(conv.id)
    const lastMsg = lastMsgByConv.get(conv.id)
    const readAt = myReadAt.get(conv.id)
    const hasUnread = !readAt
      ? !!lastMsg
      : !!(lastMsg && new Date(lastMsg.created_at) > new Date(readAt))

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

  // Explicit membership check — defense in depth alongside RLS
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
    .limit(50)

  return (data ?? []).map((m: any) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    createdAt: m.created_at,
    senderProfile: m.profiles
      ? { username: m.profiles.username, displayName: m.profiles.display_name, avatarUrl: m.profiles.avatar_url }
      : null,
  }))
}

export async function getConversationParticipants(conversationId: string, userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('conversation_participants')
    .select('user_id, profiles!conversation_participants_user_id_fkey(id, username, display_name, avatar_url)')
    .eq('conversation_id', conversationId)

  return (data ?? []).map((p: any) => ({ userId: p.user_id, profile: p.profiles }))
}

export async function getUnreadDmCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at, conversations(last_message_at)')
    .eq('user_id', userId)

  if (!data) return 0

  return data.filter((p) => {
    const conv = p.conversations as any
    if (!conv?.last_message_at) return false
    if (!p.last_read_at) return true
    return new Date(conv.last_message_at) > new Date(p.last_read_at)
  }).length
}
