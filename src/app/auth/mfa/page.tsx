'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export default function MFAPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactor = factors?.totp?.find((f) => f.status === 'verified')

    if (!totpFactor) {
      setError('No authenticator app found.')
      setLoading(false)
      return
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    })

    if (challengeError || !challenge) {
      setError('Failed to create challenge. Try again.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ''),
    })

    if (verifyError) {
      setError('Invalid code. Try again.')
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fdf0ea] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-1">
          <QuotoraLogo size={48} />
          <h1 className="text-2xl font-bold text-gray-800">Two-factor verification</h1>
          <p className="text-sm text-gray-500 text-center">Enter the 6-digit code from your authenticator app.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
              className="w-full h-14 rounded-2xl border border-gray-200 bg-white text-gray-800 text-center text-2xl tracking-widest placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors pt-2"
          >
            Sign out and try again
          </button>
        </div>
      </div>
    </div>
  )
}
