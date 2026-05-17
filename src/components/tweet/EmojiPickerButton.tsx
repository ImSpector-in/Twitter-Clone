'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

type EmojiMartEmoji = { native: string; id: string; name: string }

const Picker = dynamic(
  async () => {
    const [{ default: EmojiPicker }, { default: data }] = await Promise.all([
      import('@emoji-mart/react'),
      import('@emoji-mart/data'),
    ])
    return function EmojiMartWrapper(props: React.ComponentProps<typeof EmojiPicker>) {
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
  useClickOutside(containerRef, () => setOpen(false), open)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Insert emoji"
        aria-expanded={open}
        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
      >
        <Smile className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <Picker
            onEmojiSelect={(emoji: EmojiMartEmoji) => {
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
