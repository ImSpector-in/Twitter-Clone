'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'

const Picker = dynamic(
  async () => {
    const [{ default: EmojiPicker }, { default: data }] = await Promise.all([
      import('@emoji-mart/react'),
      import('@emoji-mart/data'),
    ])
    return function EmojiMartWrapper(props: any) {
      return <EmojiPicker {...props} data={data} />
    }
  },
  { ssr: false }
)

type Props = {
  onInsert: (emoji: string) => void
}

export default function EmojiPickerButton({ onInsert }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
        title="Emoji"
      >
        <Smile className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <Picker
            onEmojiSelect={(emoji: any) => {
              onInsert(emoji.native)
              setOpen(false)
            }}
            theme="auto"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}
