'use client'

import { useState } from 'react'
import { deleteAccount } from '@/lib/actions/account'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteAccount()
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
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
              {loading ? 'Deleting...' : 'Yes, delete my account'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
