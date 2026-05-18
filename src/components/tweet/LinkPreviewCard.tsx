'use client'

import { useState, useEffect, useRef } from 'react'

type OgData = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  url: string
}

// Module-level cache — same URL only fetched once per session
const ogCache = new Map<string, OgData | null>()

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function LinkPreviewCard({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const [og, setOg] = useState<OgData | null | undefined>(undefined)
  const [imageFailed, setImageFailed] = useState(false)

  // Trigger fetch only when card enters viewport (+ 200px root margin)
  useEffect(() => {
    setImageFailed(false)
    if (ogCache.has(url)) {
      setOg(ogCache.get(url) ?? null)
      return
    }
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldFetch(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [url])

  useEffect(() => {
    if (!shouldFetch || ogCache.has(url)) {
      if (ogCache.has(url)) setOg(ogCache.get(url) ?? null)
      return
    }
    let cancelled = false
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data: OgData) => {
        if (cancelled) return
        const value = data.title ? data : null
        ogCache.set(url, value)
        setOg(value)
      })
      .catch(() => {
        if (!cancelled) {
          ogCache.set(url, null)
          setOg(null)
        }
      })
    return () => { cancelled = true }
  }, [url, shouldFetch])

  // Always render container so the IntersectionObserver has an element to watch
  return (
    <div ref={containerRef}>
      {og && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex items-stretch gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors overflow-hidden no-underline"
        >
          {og.image && !imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/og-image?url=${encodeURIComponent(og.image)}`}
              alt=""
              className="h-20 w-20 shrink-0 object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="flex flex-col justify-center gap-0.5 py-2.5 pr-3 min-w-0">
            <span className="text-[11px] text-muted-foreground">{getDomain(url)}</span>
            <span className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
              {og.title}
            </span>
            {og.description && (
              <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                {og.description}
              </span>
            )}
          </div>
        </a>
      )}
    </div>
  )
}
