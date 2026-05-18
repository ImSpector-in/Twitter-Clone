import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries/notifications'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cursor = req.nextUrl.searchParams.get('cursor') ?? undefined
  const notifications = await getNotifications(user.id, cursor)
  const last = notifications[notifications.length - 1]
  const nextCursor = notifications.length === 30 ? (last?.created_at ?? null) : null

  return NextResponse.json({ notifications, nextCursor })
}
