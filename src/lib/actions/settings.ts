'use server'

import { requireUser } from '@/lib/auth/requireUser'
import { REPLY_SCOPES, type ReplyScope } from '@/lib/constants'

// Q-013: Move all client-side profile.update() calls server-side
// so the full profiles row is never writable directly from the browser.

export async function updatePrivacy(isPrivate: boolean) {
  const { user, supabase } = await requireUser()
  const { error } = await supabase
    .from('profiles')
    .update({ is_private: isPrivate })
    .eq('id', user.id)
  if (error) throw new Error(error.message)
}

export async function updateNotificationPref(
  field: 'notify_likes' | 'notify_replies' | 'notify_follows',
  value: boolean
) {
  const { user, supabase } = await requireUser()
  const { error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', user.id)
  if (error) throw new Error(error.message)
}

export async function updateReplyScope(scope: string) {
  if (!REPLY_SCOPES.includes(scope as ReplyScope)) throw new Error('Invalid reply scope')
  const { user, supabase } = await requireUser()
  const { error } = await supabase
    .from('profiles')
    .update({ reply_scope: scope })
    .eq('id', user.id)
  if (error) throw new Error(error.message)
}

export async function exportUserData() {
  const { user, supabase } = await requireUser()

  const [tweetsRes, likesRes, followsRes, profileRes] = await Promise.all([
    supabase.from('tweets').select('id, content, image_url, created_at').eq('user_id', user.id),
    supabase.from('likes').select('tweet_id, created_at').eq('user_id', user.id),
    supabase.from('follows').select('following_id, created_at').eq('follower_id', user.id),
    supabase.from('profiles').select('username, display_name, bio, created_at').eq('id', user.id).single(),
  ])

  return {
    exported_at: new Date().toISOString(),
    profile: profileRes.data,
    tweets: tweetsRes.data ?? [],
    likes: likesRes.data ?? [],
    following: followsRes.data ?? [],
  }
}
