'use client'

import { useEffect } from 'react'
import { markAllRead } from '@/lib/actions/notifications'

export default function MarkNotificationsRead() {
  useEffect(() => {
    markAllRead()
  }, [])

  return null
}
