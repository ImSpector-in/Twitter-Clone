'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type GifResult = { id: string; url: string; preview: string }

async function fetchGiphy(query: string, apiKey: string): Promise<GifResult[]> {
  const base = 'https://api.giphy.com/v1/gifs'
  const endpoint = query.trim()
    ? `${base}/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
    : `${base}/trending?api_key=${apiKey}&limit=20&rating=g`

  const res = await fetch(endpoint)
  if (!res.ok) return []
  const json = await res.json()

  return (json.data ?? []).map((g: any) => ({
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
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? ''

  const load = useCallback(async (q: string) => {
    if (!apiKey) return
    setLoading(true)
    try {
      setGifs(await fetchGiphy(q, apiKey))
    } catch { /* silent fail */ }
    setLoading(false)
  }, [apiKey])

  useEffect(() => {
    if (open) load('')
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => load(query), 400)
    return () => clearTimeout(t)
  }, [query, open, load])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded text-xs font-bold"
          title="GIF"
        >
          GIF
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 space-y-2" side="top" align="start" sideOffset={8}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-8 pr-7 py-1.5 text-sm rounded-lg bg-muted border border-border outline-none focus:ring-1 focus:ring-ring"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!apiKey ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Add <code className="font-mono bg-muted px-1 rounded">NEXT_PUBLIC_GIPHY_API_KEY</code> to enable GIFs
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto rounded">
              {loading && (
                <div className="col-span-2 text-center text-xs text-muted-foreground py-6">Loading...</div>
              )}
              {!loading && gifs.map(gif => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => { onSelect(gif.url); setOpen(false) }}
                  className="rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all focus:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gif.preview} alt="GIF" className="w-full h-20 object-cover" />
                </button>
              ))}
              {!loading && gifs.length === 0 && (
                <div className="col-span-2 text-center text-xs text-muted-foreground py-6">No GIFs found</div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-right">Powered by GIPHY</p>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
