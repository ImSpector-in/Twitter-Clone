'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

const SEARCH_DEBOUNCE_MS = 400

type GiphyImageVariant = { url: string }
type GiphyItem = {
  id: string
  images: {
    original?: GiphyImageVariant
    fixed_height_small?: GiphyImageVariant
    fixed_height?: GiphyImageVariant
  }
}
type GifResult = { id: string; url: string; preview: string }

async function fetchGiphy(query: string): Promise<GifResult[]> {
  const url = query.trim()
    ? `/api/giphy?q=${encodeURIComponent(query)}`
    : `/api/giphy`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`GIPHY proxy ${res.status}`)
  const json = await res.json()

  return (json.data ?? []).map((g: GiphyItem) => ({
    id: g.id,
    url: g.images?.original?.url ?? '',
    preview: g.images?.fixed_height_small?.url ?? g.images?.fixed_height?.url ?? '',
  })).filter((g: GifResult) => g.url)
}

type Props = {
  onSelect: (gifUrl: string) => void
}

export default function GifPickerButton({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, () => setOpen(false), open)

  const load = useCallback(async (q: string) => {
    setLoading(true)
    setError(false)
    try {
      setGifs(await fetchGiphy(q))
    } catch (e) {
      console.error('GIPHY fetch failed:', e)
      setError(true)
    }
    setLoading(false)
  }, [])

  // Single effect handles both initial load and debounced search
  useEffect(() => {
    if (!open) return
    if (!query.trim()) {
      load('')
      return
    }
    const t = setTimeout(() => load(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query, open, load])

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Insert GIF"
        aria-expanded={open}
        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded text-xs font-bold"
      >
        GIF
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 rounded-lg bg-popover border border-border shadow-xl z-50 p-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search GIFs..."
              className="w-full pl-8 pr-7 py-1.5 text-sm rounded-lg bg-muted border border-border outline-none focus:ring-1 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto rounded">
            {loading && (
              <div className="col-span-2 text-center text-xs text-muted-foreground py-6">Loading...</div>
            )}
            {!loading && error && (
              <div className="col-span-2 text-center text-xs text-muted-foreground py-6">
                Couldn&apos;t load GIFs. Try again.
              </div>
            )}
            {!loading && !error && gifs.map(gif => (
              <button
                key={gif.id}
                type="button"
                onClick={() => { onSelect(gif.url); setOpen(false) }}
                aria-label="Select GIF"
                className="rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gif.preview} alt="" className="w-full h-20 object-cover" />
              </button>
            ))}
            {!loading && !error && gifs.length === 0 && (
              <div className="col-span-2 text-center text-xs text-muted-foreground py-6">No GIFs found</div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-right">Powered by GIPHY</p>
        </div>
      )}
    </div>
  )
}
