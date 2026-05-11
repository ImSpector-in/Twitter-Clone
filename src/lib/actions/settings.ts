'use server'

import { createClient } from '@/lib/supabase/server'

// Q-013: Move all client-side profile.update() calls server-side
// so the full profiles row is never writable directly from the browser.

export async function updatePrivacy(isPrivate: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

export async function updateReplyScope(scope: string) {
  const allowed = ['everyone', 'followers', 'nobody']
  if (!allowed.includes(scope)) throw new Error('Invalid reply scope')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ reply_scope: scope })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}
