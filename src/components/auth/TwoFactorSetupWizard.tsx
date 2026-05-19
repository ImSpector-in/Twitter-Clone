'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTotpEnrollment } from '@/hooks/useTotpEnrollment'

export default function TwoFactorSetupWizard({ postSetupDest }: { postSetupDest: string }) {
  const router = useRouter()

  const { step, qrCode, secret, code, setCode, loading, handleEnroll, handleVerify, handleCancel } =
    useTotpEnrollment(() => {
      toast.success('Two-factor authentication enabled!')
      router.push(postSetupDest)
      router.refresh()
    })

  async function handleSkip() {
    try {
      await handleCancel()
    } catch {
      // Cleanup failed — orphaned factor will be removed on next visit to this page
    }
    router.push(postSetupDest)
    router.refresh()
  }

  if (step === 'verifying') {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">Scan this QR code</p>
          <p className="text-sm text-gray-500">Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and scan this code.</p>
        </div>

        {qrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCode} alt="2FA QR code" width={160} height={160} className="rounded-xl border bg-white p-2" />
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Never share this QR code or secret with anyone.
        </p>

        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Can&apos;t scan? Enter the code manually</summary>
          <code className="block mt-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs break-all">{secret}</code>
        </details>

        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Enter the 6-digit code from your app to confirm</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="text-center text-xl tracking-widest h-14 rounded-2xl border-gray-200 focus:ring-orange-400 w-40"
            autoFocus
            required
          />
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & enable'}
            </button>
            <Button type="button" variant="outline" onClick={handleSkip} disabled={loading} className="h-12 px-5 rounded-2xl">
              Skip
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="font-semibold text-gray-800">Protect your account</p>
        <p className="text-sm text-gray-500">
          Two-factor authentication adds a second layer of security. You&apos;ll need your authenticator app each time you log in.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Set up 2FA'}
        </button>
        <Button variant="ghost" onClick={handleSkip} disabled={loading} className="h-12 px-5 rounded-2xl text-gray-400 hover:text-gray-600">
          Skip for now
        </Button>
      </div>
    </div>
  )
}
