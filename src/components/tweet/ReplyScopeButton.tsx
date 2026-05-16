'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe2, Users, MessageSquareOff, ChevronDown } from 'lucide-react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const current = OPTIONS.find(o => o.value === value) ?? OPTIONS[0]
  const { Icon } = current

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
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-full px-2.5 py-1 transition-colors"
      >
        <Icon className="h-3.5 w-3.5" />
        {current.label} can reply
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-lg bg-popover border border-border shadow-xl z-50 p-1">
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
        </div>
      )}
    </div>
  )
}
