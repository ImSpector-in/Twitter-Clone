'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { unblockUser } from '@/lib/actions/blocks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type User = { id: string; username: string; display_name: string | null; avatar_url: string | null }

export default function BlockedList({ initialList }: { initialList: User[] }) {
  const [list, setList] = useState(initialList)

  async function handleUnblock(id: string) {
    try {
      await unblockUser(id)
      setList((prev) => prev.filter((u) => u.id !== id))
      toast.success('Unblocked.')
    } catch {
      toast.error('Failed to unblock.')
    }
  }

  if (list.length === 0) return <p className="text-sm text-muted-foreground">You haven&apos;t blocked anyone.</p>

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
            <Button variant="outline" size="sm" onClick={() => handleUnblock(u.id)}>Unblock</Button>
          </li>
        )
      })}
    </ul>
  )
}
