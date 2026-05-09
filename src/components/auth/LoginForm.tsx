'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMFA, setShowMFA] = useState(false)
  const router = useRouter()

  const inputClass = "w-full h-14 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-all"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totp = factors?.totp?.[0]
      if (totp) { setFactorId(totp.id); setShowMFA(true); setLoading(false); return }
    }
    router.push('/home'); router.refresh()
  }

  async function handleMFAVerify(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = createClient()
    const { data: challenge, error: ce } = await supabase.auth.mfa.challenge({ factorId })
    if (ce) { setError('Failed to create challenge.'); setLoading(false); return }
    const { error: ve } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: mfaCode })
    if (ve) { setError('Invalid code. Try again.'); setLoading(false); return }
    router.push('/home'); router.refresh()
  }

  if (showMFA) {
    return (
      <form onSubmit={handleMFAVerify} className="space-y-4">
        <p className="text-center text-sm text-gray-500">Enter the 6-digit code from your authenticator app.</p>
        <input type="text" inputMode="numeric" value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000" maxLength={6} autoFocus required
          className={`${inputClass} text-center text-xl tracking-[0.5em] pl-5`}
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button type="submit" disabled={loading || mfaCode.length !== 6}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <button type="button" onClick={() => setShowMFA(false)} className="w-full text-sm text-gray-400 hover:text-gray-600">Back</button>
      </form>
    )
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      {/* Email — orange icon */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 pointer-events-none" />
        <input type="email" placeholder="Username or email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className={`${inputClass} pl-12 pr-5`}
        />
      </div>

      {/* Password — orange icon */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 pointer-events-none" />
        <input type={showPassword ? 'text' : 'password'} placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required
          className={`${inputClass} pl-12 pr-12`}
        />
        <button type="button" onClick={() => setShowPassword(p => !p)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
