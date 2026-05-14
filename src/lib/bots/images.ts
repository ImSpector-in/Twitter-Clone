import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchAndUploadBotImage(keywords: string[]): Promise<string | null> {
  const buffer = await fetchImageBuffer(keywords)
  if (!buffer) return null

  try {
    const supabase = createAdminClient()
    const fileName = `bot/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const { error } = await supabase.storage
      .from('tweet-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })
    if (error) return null
    return supabase.storage.from('tweet-images').getPublicUrl(fileName).data.publicUrl
  } catch {
    return null
  }
}

async function fetchImageBuffer(keywords: string[]): Promise<Buffer | null> {
  // Primary: loremflickr — keyword-based, free, no API key
  const query = keywords.slice(0, 3).join(',')
  const primary = await tryFetch(`https://loremflickr.com/800/450/${encodeURIComponent(query)}`)
  if (primary) return primary

  // Fallback: picsum.photos — always returns a real photo
  return tryFetch(`https://picsum.photos/800/450?random=${Date.now()}`)
}

async function tryFetch(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}
