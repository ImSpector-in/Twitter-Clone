'use client'

import { useState } from 'react'
import { logoutEverywhere } from '@/lib/actions/account'
import { Button } from '@/components/ui/button'

export default function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await logoutEverywhere()
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Log out everywhere</p>
        <p className="text-muted-foreground text-sm">Sign out of all devices and sessions.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? 'Logging out...' : 'Log out all'}
      </Button>
    </div>
  )
}
