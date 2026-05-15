'use client'

import { useState } from 'react'
import TopNav from './TopNav'
import MobileMenu from './MobileMenu'

type Props = {
  username: string
  displayName: string
  avatarUrl: string | null
  unreadCount: number
  unreadDmCount: number
}

export default function MobileNavController({ username, displayName, avatarUrl, unreadCount, unreadDmCount }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <TopNav
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        onLogoClick={() => setDrawerOpen(true)}
      />
      <MobileMenu
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        unreadDmCount={unreadDmCount}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}
