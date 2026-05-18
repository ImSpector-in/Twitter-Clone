import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries/notifications'
import MarkNotificationsRead from '@/components/notifications/MarkNotificationsRead'
import NotificationsFeed from '@/components/notifications/NotificationsFeed'
import type { Notification } from '@/types'

export const metadata: Metadata = { title: 'Notifications · Quotora' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const notifications = await getNotifications(user!.id)
  const lastN = notifications[notifications.length - 1]
  const nextCursor = notifications.length === 30 ? (lastN?.created_at ?? null) : null

  return (
    <div>
      <MarkNotificationsRead />
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors" aria-label="Back to home">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <div className="p-10 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground text-sm">No notifications yet.</p>
          <Link href="/discover" className="text-sm text-primary hover:underline">
            Find people to follow
          </Link>
        </div>
      ) : (
        <NotificationsFeed
          initialNotifications={notifications as unknown as Notification[]}
          initialNextCursor={nextCursor}
        />
      )}
    </div>
  )
}
