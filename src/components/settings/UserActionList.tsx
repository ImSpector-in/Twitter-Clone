'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type User = { id: string; username: string; display_name: string | null; avatar_url: string | null }

type Props = {
  initialList: User[]
  onAction: (id: string) => Promise<void>
  actionLabel: string
  emptyText: string
  successMessage: string
  errorMessage: string
}

export default function UserActionList({ initialList, onAction, actionLabel, emptyText, successMessage, errorMessage }: Props) {
  const [list, setList] = useState(initialList)

  async function handleAction(id: string) {
    try {
      await onAction(id)
      setList((prev) => prev.filter((u) => u.id !== id))
      toast.success(successMessage)
    } catch {
      toast.error(errorMessage)
    }
  }

  if (list.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>

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
            <Button variant="outline" size="sm" onClick={() => handleAction(u.id)}>
              {actionLabel}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
