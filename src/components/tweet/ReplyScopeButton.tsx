'use client'

import { useState } from 'react'
import { Globe2, Users, MessageSquareOff, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type ReplyScope = 'everyone' | 'followers' | 'nobody'

const OPTIONS = [
  { value: 'everyone' as ReplyScope, label: 'Everyone', Icon: Globe2, description: 'Anyone can reply' },
  { value: 'followers' as ReplyScope, label: 'Followers', Icon: Users, description: 'Only your followers' },
  { value: 'nobody' as ReplyScope, label: 'Nobody', Icon: MessageSquareOff, description: 'Replies turned off' },
]

type Props = {
  value: ReplyScope
  onChange: (scope: ReplyScope) => void
}

export default function ReplyScopeButton({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = OPTIONS.find(o => o.value === value) ?? OPTIONS[0]
  const { Icon } = current

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-full px-2.5 py-1 transition-colors"
        >
          <Icon className="h-3.5 w-3.5" />
          {current.label} can reply
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start" side="top">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 py-1.5">
          Who can reply?
        </p>
        {OPTIONS.map(({ value: v, label, Icon: OptionIcon, description }) => (
          <button
            key={v}
            type="button"
            onClick={() => { onChange(v); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left ${value === v ? 'text-primary font-semibold' : ''}`}
          >
            <OptionIcon className="h-4 w-4 shrink-0" />
            <div>
              <div>{label}</div>
              <div className="text-xs text-muted-foreground font-normal">{description}</div>
            </div>
            {value === v && <span className="ml-auto text-primary">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
