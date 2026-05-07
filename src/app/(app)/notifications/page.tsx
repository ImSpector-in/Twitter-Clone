import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries/notifications'
import NotificationItem from '@/components/notifications/NotificationItem'
import MarkNotificationsRead from '@/components/notifications/MarkNotificationsRead'
import type { Notification } from '@/types'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const notifications = await getNotifications(user!.id)

  return (
    <div>
      <MarkNotificationsRead />
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No notifications yet.
        </div>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id}>
              <NotificationItem notification={n as unknown as Notification} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
