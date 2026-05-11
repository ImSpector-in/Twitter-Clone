'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ initialCount, userId }: { initialCount: number, userId: string }) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const supabase = createClient()

    // Q-018: Scope channel name to this user so subscriptions can't cross users
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => setCount((c) => c + 1)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        async () => {
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false)
          setCount(count ?? 0)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <Link
      href="/notifications"
      onClick={() => setCount(0)}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground w-fit"
    >
      <div className="relative">
        <Bell className="h-5 w-5 shrink-0" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span className="hidden xl:inline">Notifications</span>
    </Link>
  )
}
