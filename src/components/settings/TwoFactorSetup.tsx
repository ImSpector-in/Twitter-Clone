'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTotpEnrollment } from '@/hooks/useTotpEnrollment'

export default function TwoFactorSetup({ isEnabled }: { isEnabled: boolean }) {
  const [enabled, setEnabled] = useState(isEnabled)
  const [disabling, setDisabling] = useState(false)

  const { step, qrCode, secret, code, setCode, loading, handleEnroll, handleVerify, handleCancel } =
    useTotpEnrollment(() => {
      setEnabled(true)
      toast.success('Two-factor authentication enabled!')
    })

  async function handleDisable() {
    setDisabling(true)
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
    setDisabling(false)
  }

  if (enabled && step !== 'done') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Two-factor authentication</p>
          <p className="text-muted-foreground text-sm">Your account is protected with 2FA.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisable} disabled={disabling}>
          {disabling ? 'Disabling...' : 'Disable'}
        </Button>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="space-y-2">
        <p className="font-medium text-sm">Two-factor authentication</p>
        <p className="text-sm text-green-600 dark:text-green-400"><span aria-hidden="true">✓</span> Enabled successfully. Your account is now protected.</p>
        <Button variant="outline" size="sm" onClick={handleDisable} disabled={disabling}>
          {disabling ? 'Disabling...' : 'Disable 2FA'}
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

        {qrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCode} alt="2FA QR code" width={160} height={160} className="rounded border bg-white p-2" />
        )}

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
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
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
