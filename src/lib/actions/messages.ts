'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const BOT_IDS = [
  process.env.BOT_CTO_FANATIC_ID,
  process.env.BOT_UX_CRITIC_ID,
  process.env.BOT_BUILDINPUBLIC_ID,
].filter(Boolean) as string[]

export async function startConversation(otherUserId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Can't DM yourself
  if (otherUserId === user.id) throw new Error('Cannot start a conversation with yourself')

  // Can't DM bots — check before any DB work
  if (BOT_IDS.includes(otherUserId)) throw new Error("You can't message bots")

  // Validate target is a real UUID
  if (!UUID_RE.test(otherUserId)) throw new Error('User not found')

  // Block check — both directions (same generic error to avoid info leak)
  const { data: block } = await supabase
    .from('blocks')
    .select('blocker_id')
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle()

  if (block) throw new Error('Could not start conversation')

  // Confirm target user exists
  const { data: target } = await supabase.from('profiles').select('id').eq('id', otherUserId).maybeSingle()
  if (!target) throw new Error('Could not start conversation')

  // Race-condition-safe find-or-create via direct_key unique constraint.
  // Sort IDs so A→B and B→A produce the same key.
  const directKey = [user.id, otherUserId].sort().join(':')

  // Use admin client — only service role can insert conversations/participants
  const admin = createAdminClient()

  const { data: conv, error } = await admin
    .from('conversations')
    .upsert({ direct_key: directKey }, { onConflict: 'direct_key', ignoreDuplicates: false })
    .select('id')
    .single()

  if (error || !conv) throw new Error('Could not start conversation')

  // Idempotent participant upsert — safe to call even if they already exist
  await admin.from('conversation_participants').upsert(
    [
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ],
    { onConflict: 'conversation_id,user_id', ignoreDuplicates: true }
  )

  redirect(`/messages/${conv.id}`)
}

export async function sendMessage(
  conversationId: string,
  content: string,
  clientId: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Validate inputs — all generic errors to avoid info leak
  if (!UUID_RE.test(conversationId)) throw new Error('Could not send message')
  if (!UUID_RE.test(clientId)) throw new Error('Could not send message')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Message cannot be empty')
  if (trimmed.length > 1000) throw new Error('Message too long (max 1000 characters)')

  // Explicit membership check — defense in depth alongside RLS
  const { data: membership } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) throw new Error('Could not send message')

  // Rate limit: 200 messages per hour per sender
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', user.id)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= 200) throw new Error("You're sending too many messages. Please wait a while.")

  // Insert using client-provided UUID so Realtime echo can be deduped
  const { error } = await supabase.from('messages').insert({
    id: clientId,
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
  })

  // Duplicate ID = already sent (optimistic race) — not an error
  if (error && error.code !== '23505') throw new Error('Could not send message')
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
}

export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (!UUID_RE.test(messageId)) throw new Error('Invalid message')

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', user.id) // RLS UPDATE policy also enforces this

  if (error) throw new Error('Could not delete message')
}
