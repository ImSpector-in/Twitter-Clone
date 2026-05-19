'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const inputClass = "w-full h-14 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-all"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup/2fa` },
    })
    if (error) {
      // Q-023: Always show generic message — specific error leaks whether email exists
      setError('If this email is available, you\'ll receive a confirmation email shortly.')
      setLoading(false)
    }
    else if (data.session) { router.push('/setup/2fa'); router.refresh() }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) {
    return (
      <div className="text-center space-y-2 py-4">
        <p className="text-3xl" aria-hidden="true">📬</p>
        <h2 className="text-lg font-bold text-gray-800">Check your email</h2>
        <p className="text-sm text-gray-500">We sent a confirmation link to <strong>{email}</strong>.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <label htmlFor="signup-email" className="sr-only">Email address</label>
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 pointer-events-none" aria-hidden="true" />
        <input id="signup-email" type="email" placeholder="Email address" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className={`${inputClass} pl-12 pr-5`}
        />
      </div>
      <div className="relative">
        <label htmlFor="signup-password" className="sr-only">Password (minimum 12 characters)</label>
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400 pointer-events-none" aria-hidden="true" />
        <input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="Password (min 12 characters)"
          value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} required
          className={`${inputClass} pl-12 pr-12`}
        />
        <button type="button" onClick={() => setShowPassword(p => !p)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {password.length > 0 && password.length < 12 && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Password must be at least 12 characters ({password.length}/12)
        </p>
      )}
      {error && <p role="alert" className="text-sm text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
