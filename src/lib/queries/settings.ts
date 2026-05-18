import { createClient } from '@/lib/supabase/server'

type UserRow = { id: string; username: string; display_name: string | null; avatar_url: string | null }

export async function getBlockedUsers(userId: string): Promise<UserRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blocks')
    .select('profiles!blocks_blocked_id_fkey (id, username, display_name, avatar_url)')
    .eq('blocker_id', userId)
  return (data?.map((r: { profiles: unknown }) => r.profiles).filter(Boolean) ?? []) as UserRow[]
}

export async function getMutedUsers(userId: string): Promise<UserRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mutes')
    .select('profiles!mutes_muted_id_fkey (id, username, display_name, avatar_url)')
    .eq('muter_id', userId)
  return (data?.map((r: { profiles: unknown }) => r.profiles).filter(Boolean) ?? []) as UserRow[]
}

export async function getMutedWords(userId: string): Promise<{ id: string; word: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('muted_words')
    .select('id, word')
    .eq('user_id', userId)
    .order('created_at')
  return data ?? []
}

export async function getPrivacySettings(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('is_private, reply_scope')
    .eq('id', userId)
    .single()
  return data
}

export async function getNotificationSettings(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('notify_likes, notify_replies, notify_follows')
    .eq('id', userId)
    .single()
  return data
}
