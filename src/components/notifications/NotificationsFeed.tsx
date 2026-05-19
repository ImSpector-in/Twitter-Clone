'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import NotificationItem from './NotificationItem'
import type { Notification } from '@/types'

type Props = {
  initialNotifications: Notification[]
  initialNextCursor: string | null
}

export default function NotificationsFeed({ initialNotifications, initialNextCursor }: Props) {
  const [items, setItems] = useState<Notification[]>(initialNotifications)
  const [cursor, setCursor] = useState<string | null>(initialNextCursor)
  const [loading, setLoading] = useState(false)

  async function loadMore() {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?cursor=${encodeURIComponent(cursor)}`)
      if (!res.ok) throw new Error('Failed')
      const { notifications, nextCursor } = await res.json() as {
        notifications: Notification[]
        nextCursor: string | null
      }
      setItems((prev) => [...prev, ...notifications])
      setCursor(nextCursor)
    } catch {
      toast.error('Could not load more notifications.')
    } finally {
      setLoading(false)
    }
  }

  function handleNotificationHandled(notificationId: string) {
    setItems((prev) => prev.filter((n) => n.id !== notificationId))
  }

  return (
    <>
      <ul aria-label="Notifications">
        {items.map((n) => (
          <li key={n.id}>
            <NotificationItem notification={n} onHandled={handleNotificationHandled} />
          </li>
        ))}
      </ul>
      {cursor && (
        <div className="p-4 text-center border-t">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
