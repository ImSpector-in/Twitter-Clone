'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { unmuteUser } from '@/lib/actions/mutes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type User = { id: string; username: string; display_name: string | null; avatar_url: string | null }

export default function MutedList({ initialList }: { initialList: User[] }) {
  const [list, setList] = useState(initialList)

  async function handleUnmute(id: string) {
    try {
      await unmuteUser(id)
      setList((prev) => prev.filter((u) => u.id !== id))
      toast.success('Unmuted.')
    } catch {
      toast.error('Failed to unmute.')
    }
  }

  if (list.length === 0) return <p className="text-sm text-muted-foreground">You haven&apos;t muted anyone.</p>

  return (
    <ul className="space-y-2">
      {list.map((u) => {
        const name = u.display_name || u.username
        return (
          <li key={u.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.avatar_url ?? undefined} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleUnmute(u.id)}>Unmute</Button>
          </li>
        )
      })}
    </ul>
  )
}
