import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 30

export async function getNotifications(userId: string, cursor?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select(`
      id,
      type,
      read,
      created_at,
      tweet_id,
      actor:profiles!actor_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return count ?? 0
}
