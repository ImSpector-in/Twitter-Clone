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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/home')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
