'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Feather } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TweetComposer from './TweetComposer'

export default function FloatingPostButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (pathname.startsWith('/messages')) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="New post"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:opacity-90 transition-opacity"
      >
        <Feather className="h-6 w-6" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-sm:!top-14 max-sm:!translate-y-0">
          <DialogHeader>
            <DialogTitle>New post</DialogTitle>
          </DialogHeader>
          <TweetComposer onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
