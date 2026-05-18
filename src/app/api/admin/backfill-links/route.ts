import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scanUrls } from '@/lib/utils/safeBrowsing'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BATCH_SIZE = 50
const URL_RE = /https?:\/\/\S+/g

function timingSafeCheck(secret: string, auth: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(auth)
  if (expected.length !== received.length) return false
  const { timingSafeEqual } = require('crypto')
  return timingSafeEqual(expected, received)
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (!secret || !timingSafeCheck(secret, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: tweets, error: fetchError } = await supabase
    .from('tweets')
    .select('id, content')
    .is('link_status', null)
    .limit(BATCH_SIZE)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!tweets || tweets.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, flagged: 0, clean: 0, none: 0 })
  }

  let flagged = 0
  let clean = 0
  let none = 0

  for (const tweet of tweets) {
    const urls = tweet.content?.match(URL_RE) ?? []

    let status: 'clean' | 'flagged' | 'none'

    if (urls.length === 0) {
      status = 'none'
      none++
    } else {
      status = await scanUrls(urls)
      if (status === 'flagged') {
        flagged++
      } else {
        clean++
      }
    }

    const { error: updateError } = await supabase
      .from('tweets')
      .update({ link_status: status })
      .eq('id', tweet.id)

    if (updateError) {
      console.error(`[backfill-links] Failed to update tweet ${tweet.id}:`, updateError.message)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: tweets.length,
    flagged,
    clean,
    none,
  })
}
