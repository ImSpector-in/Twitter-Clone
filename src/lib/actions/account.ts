'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Verify current password before allowing change
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (authError) throw new Error('Current password is incorrect')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)

  // Invalidate all other sessions
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

  // Verify current password before allowing email change
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

  // Require password confirmation before deleting
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })
  if (authError) throw new Error('Incorrect password')

  const admin = createAdminClient()
  await admin.from('profiles').delete().eq('id', user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(error.message)

  redirect('/login')
}
