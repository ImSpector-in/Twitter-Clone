'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const username = (formData.get('username') as string).trim().toLowerCase()
  const display_name = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()

  if (!username) throw new Error('Username is required')
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error('Username must be 3-20 characters: letters, numbers, underscores only')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username, display_name: display_name || null, bio: bio || null })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') throw new Error('That username is already taken')
    throw new Error(error.message)
  }

  revalidatePath(`/profile/${username}`)
  return { username }
}
