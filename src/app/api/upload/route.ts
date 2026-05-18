import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

const ALLOWED_BUCKETS = ['tweet-images', 'avatars'] as const
type Bucket = (typeof ALLOWED_BUCKETS)[number]

// Magic byte signatures for allowed image types
function detectMimeType(bytes: Uint8Array): { mime: string; ext: string } | null {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' }
  }
  // GIF: 47 49 46 38 (GIF8)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { mime: 'image/gif', ext: 'gif' }
  }
  // WebP: RIFF at 0-3, WEBP at 8-11
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

export async function POST(request: Request) {
  // Must be authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Reject oversized uploads before buffering the body to avoid memory abuse
  const HARD_MAX = 5 * 1024 * 1024
  const contentLengthHeader = (request as Request).headers.get('content-length')
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader)
    if (Number.isFinite(declared) && declared > HARD_MAX) {
      return NextResponse.json({ error: `File too large (max ${HARD_MAX / 1024 / 1024}MB)` }, { status: 413 })
    }
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!bucket || !ALLOWED_BUCKETS.includes(bucket as Bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  // Size limits: 2MB for avatars, 5MB for tweet images
  const maxSize = bucket === 'avatars' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large (max ${maxSize / 1024 / 1024}MB)` }, { status: 400 })
  }

  // Read file bytes and validate magic bytes — never trust filename or Content-Type
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const detected = detectMimeType(bytes)

  if (!detected) {
    return NextResponse.json({ error: 'File type not allowed. Upload JPEG, PNG, GIF, or WebP only.' }, { status: 400 })
  }

  // Q-025: Random UUID path — never include user ID or timestamps
  const path = `${randomUUID()}.${detected.ext}`

  // Upload via admin client — bypasses RLS so random paths always work
  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, buffer, { contentType: detected.mime, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
