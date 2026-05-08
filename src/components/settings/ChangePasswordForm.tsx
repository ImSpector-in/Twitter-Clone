'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { changePassword } from '@/lib/actions/account'
import { Button } from '@/components/ui/button'
import PasswordInput from '@/components/ui/password-input'

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await changePassword(new FormData(e.currentTarget))
      toast.success('Password updated.')
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Password</p>
          <p className="text-muted-foreground text-sm">Change your account password.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Cancel' : 'Change'}
        </Button>
      </div>
      {open && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <PasswordInput name="password" placeholder="New password" minLength={6} required />
          <PasswordInput name="confirm" placeholder="Confirm new password" required />
          <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Save password'}</Button>
        </form>
      )}
    </div>
  )
}
