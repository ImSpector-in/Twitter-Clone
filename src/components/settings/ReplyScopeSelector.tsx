'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Globe, Users, Lock } from 'lucide-react'

const OPTIONS = [
  { value: 'everyone', label: 'Everyone', description: 'Anyone can reply to your tweets.', icon: Globe },
  { value: 'followers', label: 'Followers only', description: 'Only people who follow you can reply.', icon: Users },
  { value: 'nobody', label: 'Nobody', description: 'No one can reply to your tweets.', icon: Lock },
] as const

export default function ReplyScopeSelector({ initialScope }: { initialScope: string }) {
  const [scope, setScope] = useState(initialScope)

  async function handleChange(value: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ reply_scope: value }).eq('id', user!.id)
    if (error) {
      toast.error('Failed to save preference.')
    } else {
      setScope(value)
      toast.success('Reply preference saved.')
    }
  }

  return (
    <div className="space-y-2">
      {OPTIONS.map(({ value, label, description, icon: Icon }) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${scope === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {scope === value && <div className="h-3 w-3 rounded-full bg-primary shrink-0" />}
        </button>
      ))}
    </div>
  )
}
