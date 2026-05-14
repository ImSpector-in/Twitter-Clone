'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import PasswordInput from '@/components/ui/password-input'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // The auth/callback route handler already exchanged the code and set the session.
    // We just verify there's an active session before showing the form.
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        setError('Reset link is invalid or has expired. Please request a new one.')
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 12) { setError('Password must be at least 12 characters'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) setError(error.message)
    else router.push('/home')

    setLoading(false)
  }

  if (!ready && !error) {
    return <p className="text-center text-muted-foreground text-sm">Verifying reset link…</p>
  }

  if (error && !ready) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-sm">{error}</p>
        <a href="/forgot-password" className="text-primary hover:underline text-sm">
          Request a new reset link
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        placeholder="New password (min 12 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <PasswordInput
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <QuotoraLogo size={48} />
          </div>
          <h2 className="text-xl font-semibold">Set new password</h2>
        </div>
        <Suspense fallback={<p className="text-center text-muted-foreground text-sm">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
