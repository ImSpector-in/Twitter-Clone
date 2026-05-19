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

    // Reuse any existing unverified factor to prevent duplicate enrollment
    // (e.g. two tabs open simultaneously, or an abandoned previous session)
    const { data: existing } = await supabase.auth.mfa.listFactors()
    // Unverified factors appear in `all`, not `totp` (which only contains verified factors)
    const pending = existing?.all?.find((f) => f.factor_type === 'totp' && f.status === 'unverified')

    let enrolledFactorId: string
    let enrolledQr: string
    let enrolledSecret: string

    if (pending) {
      // Re-challenge the existing unverified factor
      enrolledFactorId = pending.id
      enrolledQr = ''
      enrolledSecret = ''
    } else {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Quotora',
        friendlyName: 'Authenticator App',
      })
      if (error || !data) {
        toast.error('Failed to start 2FA setup. Try again.')
        setLoading(false)
        return
      }
      enrolledFactorId = data.id
      enrolledQr = data.totp.qr_code
      enrolledSecret = data.totp.secret
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrolledFactorId,
    })
    if (challengeError || !challenge) {
      toast.error('Failed to create challenge. Try again.')
      setLoading(false)
      return
    }

    setFactorId(enrolledFactorId)
    setQrCode(enrolledQr)
    setSecret(enrolledSecret)
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
    onSuccess?.()
    setLoading(false)
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
