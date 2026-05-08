'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function changePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) throw new Error('Passwords do not match')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

export async function changeEmail(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) throw new Error('Email is required')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback` }
  )
  if (error) throw new Error(error.message)
}

export async function logoutEverywhere() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/login')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Delete profile (cascades to tweets, likes, follows, notifications)
  const admin = createAdminClient()
  await admin.from('profiles').delete().eq('id', user.id)

  // Delete auth user
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(error.message)

  redirect('/login')
}
