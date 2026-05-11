'use client'

import { useState } from 'react'
import { deleteAccount } from '@/lib/actions/account'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PasswordInput from '@/components/ui/password-input'
import { toast } from 'sonner'

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await deleteAccount(new FormData(e.currentTarget))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm text-destructive">Delete account</p>
          <p className="text-muted-foreground text-sm">Permanently delete your account and all your data.</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>Delete</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account, all your tweets, likes, follows, and notifications. This cannot be undone.
          </p>
          <form onSubmit={handleDelete} className="space-y-3 pt-2">
            <PasswordInput name="password" placeholder="Enter your password to confirm" required />
            <div className="flex gap-3">
              <Button type="submit" variant="destructive" disabled={loading} className="flex-1">
                {loading ? 'Deleting...' : 'Yes, delete my account'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
