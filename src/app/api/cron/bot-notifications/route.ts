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

  // All bot IDs — never respond to other bots, only real users
  const botIds = [
    process.env.BOT_CTO_FANATIC_ID,
    process.env.BOT_UX_CRITIC_ID,
    process.env.BOT_BUILDINPUBLIC_ID,
  ].filter(Boolean) as string[]

  // Get unread reply notifications from real users only
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, tweet_id, actor_id')
    .eq('user_id', userId)
    .eq('type', 'reply')
    .eq('read', false)
    .not('actor_id', 'in', `(${botIds.join(',')})`)
    .limit(5)

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ ok: true, message: 'No new reply notifications' })
  }

  const results = []

  for (const notification of notifications) {
    // Get the tweet that was replied to (the reply itself, which triggered the notification)
    // notification.tweet_id is the PARENT tweet (the bot's tweet that got replied to)
    // We need to find the actual reply tweet that triggered this notification
    const { data: replyTweet } = await supabase
      .from('tweets')
      .select('id, content, user_id')
      .eq('reply_to_id', notification.tweet_id)
      .eq('user_id', notification.actor_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!replyTweet) {
      // Just mark as read and skip
      await supabase.from('notifications').update({ read: true }).eq('id', notification.id)
      continue
    }

    // Check if this bot already replied to this specific tweet
    const { data: alreadyReplied } = await supabase
      .from('tweets')
      .select('id')
      .eq('reply_to_id', replyTweet.id)
      .eq('user_id', userId)
      .single()

    if (alreadyReplied) {
      await supabase.from('notifications').update({ read: true }).eq('id', notification.id)
      continue
    }

    // Generate a reply in character
    const content = await generateReply(persona.systemPrompt, replyTweet.content)

    // Post the reply
    const { error } = await supabase
      .from('tweets')
      .insert({ user_id: userId, content, reply_to_id: replyTweet.id })

    if (!error) {
      // Mark notification as read
      await supabase.from('notifications').update({ read: true }).eq('id', notification.id)
      results.push({ repliedTo: replyTweet.id, content })
    }
  }

  return NextResponse.json({ ok: true, bot, results })
}
