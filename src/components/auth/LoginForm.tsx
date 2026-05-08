'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/ui/password-input'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMFA, setShowMFA] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if MFA is required
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      // Get the factor ID
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totp = factors?.totp?.[0]
      if (totp) {
        setFactorId(totp.id)
        setShowMFA(true)
        setLoading(false)
        return
      }
    }

    router.push('/home')
    router.refresh()
  }

  async function handleMFAVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) {
      setError('Failed to create challenge.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaCode,
    })

    if (verifyError) {
      setError('Invalid code. Try again.')
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  if (showMFA) {
    return (
      <form onSubmit={handleMFAVerify} className="space-y-4">
        <div className="text-center space-y-1">
          <p className="font-semibold">Two-factor authentication</p>
          <p className="text-muted-foreground text-sm">Enter the 6-digit code from your authenticator app.</p>
        </div>
        <Input
          type="text"
          inputMode="numeric"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          maxLength={6}
          className="text-center text-lg tracking-widest"
          autoFocus
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
        <button type="button" onClick={() => setShowMFA(false)} className="w-full text-sm text-muted-foreground hover:underline">
          Back to login
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </Button>
      <div className="flex justify-between text-sm">
        <p className="text-muted-foreground">
          No account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  )
}
