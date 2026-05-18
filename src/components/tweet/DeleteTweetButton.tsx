'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { deleteTweet } from '@/lib/actions/tweets'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function DeleteTweetButton({ tweetId }: { tweetId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    setConfirmOpen(false)
    try {
      await deleteTweet(tweetId)
    } catch {
      toast.error('Failed to delete tweet.')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="text-muted-foreground hover:text-destructive text-xs transition-colors disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete tweet?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
