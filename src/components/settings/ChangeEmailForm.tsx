'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { changeEmail } from '@/lib/actions/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/ui/password-input'

export default function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await changeEmail(new FormData(e.currentTarget))
      setSent(true)
      toast.success('Confirmation sent to your new email.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Email</p>
          <p className="text-muted-foreground text-sm">{currentEmail}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? 'Cancel' : 'Change'}
        </Button>
      </div>
      {open && !sent && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <Input name="email" type="email" placeholder="New email address" required />
          <PasswordInput name="current_password" placeholder="Current password to confirm" required />
          <Button type="submit" size="sm" disabled={loading}>{loading ? 'Sending...' : 'Send confirmation'}</Button>
        </form>
      )}
      {sent && <p className="text-sm text-muted-foreground">Check your new email for a confirmation link.</p>}
    </div>
  )
}
