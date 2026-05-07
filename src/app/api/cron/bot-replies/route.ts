import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReply } from '@/lib/bots/gemini'
import { BOTS, type BotKey } from '@/lib/bots/personas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bot } = await request.json() as { bot: BotKey }
  if (!bot || !BOTS[bot]) {
    return NextResponse.json({ error: `Unknown bot: ${bot}` }, { status: 400 })
  }

  const persona = BOTS[bot]
  const userId = process.env[persona.userIdEnv]
  if (!userId) {
    return NextResponse.json({ error: `Env var ${persona.userIdEnv} not set` }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Fetch recent top-level tweets the bot hasn't already replied to
  const { data: recentTweets } = await supabase
    .from('tweets')
    .select('id, content, user_id')
    .is('reply_to_id', null)
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!recentTweets || recentTweets.length === 0) {
    return NextResponse.json({ ok: true, message: 'No tweets to reply to' })
  }

  // Filter out tweets the bot already replied to
  const { data: existingReplies } = await supabase
    .from('tweets')
    .select('reply_to_id')
    .eq('user_id', userId)
    .not('reply_to_id', 'is', null)
    .in('reply_to_id', recentTweets.map((t) => t.id))

  const alreadyReplied = new Set(existingReplies?.map((r) => r.reply_to_id) ?? [])
  const eligible = recentTweets.filter((t) => !alreadyReplied.has(t.id))

  if (eligible.length === 0) {
    return NextResponse.json({ ok: true, message: 'Already replied to all recent tweets' })
  }

  // Pick one random tweet to reply to
  const target = eligible[Math.floor(Math.random() * eligible.length)]
  const content = await generateReply(persona.systemPrompt, target.content)

  const { error } = await supabase
    .from('tweets')
    .insert({ user_id: userId, content, reply_to_id: target.id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, bot, repliedTo: target.id, content })
}
