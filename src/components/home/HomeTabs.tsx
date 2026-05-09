'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function HomeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'for-you'

  return (
    <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-3">
      <button
        onClick={() => router.push('/home')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150
          ${tab === 'for-you'
            ? 'bg-background text-foreground shadow-sm font-semibold'
            : 'text-muted-foreground hover:text-foreground'
          }`}
      >
        For You
      </button>
      <button
        onClick={() => router.push('/home?tab=following')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150
          ${tab === 'following'
            ? 'bg-background text-foreground shadow-sm font-semibold'
            : 'text-muted-foreground hover:text-foreground'
          }`}
      >
        Following
      </button>
    </div>
  )
}
