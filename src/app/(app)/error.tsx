'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <p className="text-muted-foreground text-sm">Something went wrong loading this page.</p>
      <button
        type="button"
        onClick={reset}
        className="text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>
  )
}
