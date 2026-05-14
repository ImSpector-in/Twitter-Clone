'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EmailOtpType } from '@supabase/supabase-js'
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
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      // Path 1: session already set server-side by /auth/confirm
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setReady(true); return }

      // Path 2: email link sent token_hash directly to this page
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') as EmailOtpType | null
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error) { setReady(true); return }
        setError('Reset link is invalid or has expired. Please request a new one.')
        return
      }

      // No session, no token — link is invalid
      setError('Reset link is invalid or has expired. Please request a new one.')
    }

    init()
  }, [searchParams])

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

  return (
    <div>
      {!ready && !error && (
        <p className="text-center text-muted-foreground text-sm">Verifying reset link…</p>
      )}

      {error && !ready && (
        <div className="text-center space-y-4">
          <p className="text-destructive text-sm">{error}</p>
          <a href="/forgot-password" className="text-primary hover:underline text-sm">
            Request a new reset link
          </a>
        </div>
      )}

      {ready && (
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
      )}
    </div>
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
