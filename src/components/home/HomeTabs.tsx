'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function HomeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'for-you'

  return (
    <div className="flex border-b">
      <button
        onClick={() => router.push('/home')}
        className={`flex-1 py-3 text-sm font-semibold transition-colors hover:bg-muted/50 ${
          tab === 'for-you' ? 'border-b-2 border-primary' : 'text-muted-foreground'
        }`}
      >
        For You
      </button>
      <button
        onClick={() => router.push('/home?tab=following')}
        className={`flex-1 py-3 text-sm font-semibold transition-colors hover:bg-muted/50 ${
          tab === 'following' ? 'border-b-2 border-primary' : 'text-muted-foreground'
        }`}
      >
        Following
      </button>
    </div>
  )
}
