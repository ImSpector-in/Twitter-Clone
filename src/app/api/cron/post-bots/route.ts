import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateTweet } from '@/lib/bots/gemini'
import { BOTS, type BotKey } from '@/lib/bots/personas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  // Q-012: Timing-safe secret comparison
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(auth)
  const { timingSafeEqual } = await import('crypto')
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  const { bot } = await request.json() as { bot: BotKey }
  if (!bot || !BOTS[bot]) {
    return NextResponse.json({ error: `Unknown bot: ${bot}` }, { status: 400 })
  }

  const persona = BOTS[bot]
  const userId = process.env[persona.userIdEnv]
  if (!userId) {
    return NextResponse.json({ error: `Env var ${persona.userIdEnv} not set` }, { status: 500 })
  }

  // Pick a random topic
  const topic = persona.topics[Math.floor(Math.random() * persona.topics.length)]

  // Generate tweet content
  const content = await generateTweet(persona.systemPrompt, topic)

  // Insert tweet using service role (bypasses RLS)
  const supabase = createAdminClient()
  const { error } = await supabase.from('tweets').insert({ user_id: userId, content })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, bot, topic, content })
}
