'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Load both the picker component and its data lazily so they don't bloat the initial bundle
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
          title="Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-none shadow-xl"
        side="top"
        align="start"
        sideOffset={8}
      >
        <Picker
          onEmojiSelect={(emoji: any) => {
            onInsert(emoji.native)
            setOpen(false)
          }}
          theme="auto"
          previewPosition="none"
          skinTonePosition="none"
        />
      </PopoverContent>
    </Popover>
  )
}
