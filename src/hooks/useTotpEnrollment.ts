'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export type TotpStep = 'idle' | 'verifying' | 'done'

export interface UseTotpEnrollmentReturn {
  step: TotpStep
  qrCode: string
  secret: string
  factorId: string
  code: string
  setCode: (code: string) => void
  loading: boolean
  handleEnroll: () => Promise<void>
  handleVerify: (e: React.FormEvent) => Promise<void>
  handleCancel: () => Promise<void>
}

export function useTotpEnrollment(onSuccess?: () => void): UseTotpEnrollmentReturn {
  const [step, setStep] = useState<TotpStep>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEnroll() {
    setLoading(true)
    const supabase = createClient()

    // Always enroll fresh — unenroll any stale unverified factors first.
    // Reusing an existing unverified factor omits the QR/secret (Supabase doesn't
    // re-expose them), leaving the user with nothing to scan.
    const { data: existing } = await supabase.auth.mfa.listFactors()
    const stale = existing?.all?.filter((f) => f.factor_type === 'totp' && f.status === 'unverified') ?? []
    if (stale.length > 0) {
      await Promise.all(stale.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })))
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Quotora',
      // Include timestamp so re-enrollment from settings doesn't collide with existing name
      friendlyName: `Authenticator (${new Date().toLocaleDateString()})`,
    })
    if (error || !data) {
      toast.error('Failed to start 2FA setup. Try again.')
      setLoading(false)
      return
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: data.id,
    })
    if (challengeError || !challenge) {
      toast.error('Failed to create challenge. Try again.')
      setLoading(false)
      return
    }

    setFactorId(data.id)
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setChallengeId(challenge.id)
    setStep('verifying')
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
    if (error) {
      toast.error('Invalid code. Please try again.')
      setLoading(false)
      return
    }
    setStep('done')
    setLoading(false) // before onSuccess — component may unmount during navigation
    onSuccess?.()
  }

  // Unenrolls any pending unverified factor before navigating away.
  // Prevents the user being locked out on next login (middleware would see
  // nextLevel === 'aal2' with no way to complete the challenge).
  async function handleCancel() {
    if (!factorId) return
    const supabase = createClient()
    await supabase.auth.mfa.unenroll({ factorId })
    setStep('idle')
    setFactorId('')
    setQrCode('')
    setSecret('')
    setCode('')
  }

  return { step, qrCode, secret, factorId, code, setCode, loading, handleEnroll, handleVerify, handleCancel }
}
