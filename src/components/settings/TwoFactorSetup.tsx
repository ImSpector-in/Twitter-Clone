'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'idle' | 'enrolling' | 'verifying' | 'done'

export default function TwoFactorSetup({ isEnabled }: { isEnabled: boolean }) {
  const [step, setStep] = useState<Step>('idle')
  const [qrCode, setQrCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEnroll() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Twitter Clone' })
    if (error || !data) {
      toast.error('Failed to start 2FA setup.')
    } else {
      setQrCode(data.totp.qr_code)
      setFactorId(data.id)
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: data.id })
      if (challenge) setChallengeId(challenge.id)
      setStep('verifying')
    }
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
    if (error) {
      toast.error('Invalid code. Try again.')
    } else {
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
      await supabase.auth.mfa.unenroll({ factorId: factor.id })
      toast.success('Two-factor authentication disabled.')
    }
    setLoading(false)
  }

  if (isEnabled) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Two-factor authentication</p>
          <p className="text-muted-foreground text-sm">Currently enabled.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisable} disabled={loading}>Disable</Button>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div>
        <p className="font-medium text-sm">Two-factor authentication</p>
        <p className="text-green-600 text-sm mt-1">✓ Enabled successfully.</p>
      </div>
    )
  }

  if (step === 'verifying') {
    return (
      <div className="space-y-3">
        <p className="font-medium text-sm">Scan this QR code with your authenticator app</p>
        {qrCode && <Image src={qrCode} alt="2FA QR code" width={160} height={160} className="rounded border" />}
        <form onSubmit={handleVerify} className="space-y-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} required />
          <Button type="submit" size="sm" disabled={loading}>{loading ? 'Verifying...' : 'Verify & enable'}</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Two-factor authentication</p>
        <p className="text-muted-foreground text-sm">Add an extra layer of security to your account.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleEnroll} disabled={loading}>Set up</Button>
    </div>
  )
}
