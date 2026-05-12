import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchAndUploadBotImage(keywords: string[]): Promise<string | null> {
  try {
    const query = encodeURIComponent(keywords.slice(0, 3).join(','))
    const res = await fetch(`https://source.unsplash.com/800x450/?${query}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    const fileName = `bot/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`

    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from('tweet-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })

    if (error) return null

    return supabase.storage.from('tweet-images').getPublicUrl(fileName).data.publicUrl
  } catch {
    return null
  }
}
