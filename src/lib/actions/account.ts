'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

async function checkRateLimit(userId: string, action: string): Promise<void> {
  const admin = createAdminClient()
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  // Insert FIRST, then count — eliminates TOCTOU race where parallel requests
  // could all observe count < MAX before inserting.
  await admin.from('auth_attempts').insert({ user_id: userId, action })

  const { count } = await admin
    .from('auth_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart)

  if ((count ?? 0) > MAX_ATTEMPTS) {
    throw new Error(`Too many attempts. Please wait ${WINDOW_MINUTES} minutes before trying again.`)
  }
}

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('current_password') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!currentPassword) throw new Error('Current password is required')
  if (password !== confirm) throw new Error('Passwords do not match')
  if (password.length < 12) throw new Error('Password must be at least 12 characters')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')

  await checkRateLimit(user.id, 'change_password')

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (authError) throw new Error('Current password is incorrect')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)

  await supabase.auth.signOut({ scope: 'others' })
}

export async function changeEmail(formData: FormData) {
  const email = formData.get('email') as string
  const currentPassword = formData.get('current_password') as string

  if (!email) throw new Error('Email is required')
  if (!currentPassword) throw new Error('Current password is required')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')

  await checkRateLimit(user.id, 'change_email')

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (authError) throw new Error('Current password is incorrect')

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

export async function deleteAccount(formData: FormData) {
  const password = formData.get('password') as string
  if (!password) throw new Error('Password is required to delete your account')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')

  await checkRateLimit(user.id, 'delete_account')

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })
  if (authError) throw new Error('Incorrect password')

  const admin = createAdminClient()
  // Delete auth user first — profiles cascade-delete via FK
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(error.message)

  redirect('/login')
}
