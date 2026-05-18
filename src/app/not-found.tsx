import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: '404 Not Found · Quotora' }

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link href="/home" className="text-primary hover:underline text-sm">
        Go home
      </Link>
    </div>
  )
}
