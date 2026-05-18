'use client'

import { useEffect } from 'react'

export default function RootError({
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
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-muted-foreground text-sm">Something went wrong.</p>
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
