'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'idle' | 'verifying' | 'done'

export default function TwoFactorSetup({ isEnabled }: { isEnabled: boolean }) {
  const [step, setStep] = useState<Step>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(isEnabled)

  async function handleEnroll() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Twitter Clone',
      friendlyName: 'Authenticator App',
    })
    if (error || !data) {
      toast.error('Failed to start 2FA setup. Try again.')
    } else {
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: data.id })
      if (challengeError || !challenge) {
        toast.error('Failed to create challenge.')
      } else {
        setChallengeId(challenge.id)
        setStep('verifying')
      }
    }
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
    if (error) {
      toast.error('Invalid code. Please try again.')
    } else {
      setEnabled(true)
      setStep('done')
      toast.success('Two-factor authentication enabled!')
    }
    setLoading(false)
  }

  async function handleDisable() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.auth.mfa.listFactors()
    const factor = data?.totp?.[0]
    if (factor) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
      if (error) {
        toast.error('Failed to disable 2FA.')
      } else {
        setEnabled(false)
        toast.success('Two-factor authentication disabled.')
      }
    }
    setLoading(false)
  }

  if (enabled && step !== 'done') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Two-factor authentication</p>
          <p className="text-muted-foreground text-sm">Your account is protected with 2FA.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisable} disabled={loading}>
          {loading ? 'Disabling...' : 'Disable'}
        </Button>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="space-y-2">
        <p className="font-medium text-sm">Two-factor authentication</p>
        <p className="text-sm text-green-600 dark:text-green-400"><span aria-hidden="true">✓</span> Enabled successfully. Your account is now protected.</p>
        <Button variant="outline" size="sm" onClick={handleDisable} disabled={loading}>
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </Button>
      </div>
    )
  }

  if (step === 'verifying') {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-medium text-sm mb-1">Scan this QR code</p>
          <p className="text-muted-foreground text-sm">Open your authenticator app (Google Authenticator, Authy, etc.) and scan this code.</p>
        </div>

        {/* QR Code — use img tag since Supabase returns a data URI */}
        {qrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCode} alt="2FA QR code" width={160} height={160} className="rounded border bg-white p-2" />
        )}

        {/* Manual entry fallback */}
        <details className="text-sm">
          <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Can&apos;t scan the code? Enter manually</summary>
          <code className="block mt-2 bg-muted px-3 py-2 rounded text-xs break-all">{secret}</code>
        </details>

        <form onSubmit={handleVerify} className="space-y-2">
          <p className="text-sm font-medium">Enter the 6-digit code from your app to confirm</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest w-36"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & enable'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setStep('idle')}>Cancel</Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Two-factor authentication</p>
        <p className="text-muted-foreground text-sm">Add an extra layer of security using an authenticator app.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleEnroll} disabled={loading}>
        {loading ? 'Loading...' : 'Set up'}
      </Button>
    </div>
  )
}
