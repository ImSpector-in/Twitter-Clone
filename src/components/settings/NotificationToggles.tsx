'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateNotificationPref } from '@/lib/actions/settings'

type Props = {
  initialLikes: boolean
  initialReplies: boolean
  initialFollows: boolean
}

function Toggle({ label, description, value, onChange }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function NotificationToggles({ initialLikes, initialReplies, initialFollows }: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [replies, setReplies] = useState(initialReplies)
  const [follows, setFollows] = useState(initialFollows)

  async function update(field: 'notify_likes' | 'notify_replies' | 'notify_follows', value: boolean) {
    try {
      await updateNotificationPref(field, value)
    } catch {
      toast.error('Failed to save preference.')
    }
  }

  return (
    <div className="space-y-4">
      <Toggle label="Likes" description="When someone likes your tweet." value={likes} onChange={(v) => { setLikes(v); update('notify_likes', v) }} />
      <Toggle label="Replies" description="When someone replies to your tweet." value={replies} onChange={(v) => { setReplies(v); update('notify_replies', v) }} />
      <Toggle label="Follows" description="When someone follows you." value={follows} onChange={(v) => { setFollows(v); update('notify_follows', v) }} />
    </div>
  )
}
