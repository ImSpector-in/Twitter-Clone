import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOTS, type BotKey } from '@/lib/bots/personas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BOT_PROFILES: Record<BotKey, { username: string; display_name: string; bio: string }> = {
  cto_fanatic: {
    username: 'automation_pulse',
    display_name: 'Automation Pulse',
    bio: 'n8n workflows, automation tips, and building an agency around things that run themselves.',
  },
  ux_critic: {
    username: 'ux_critic',
    display_name: 'UX Critic',
    bio: 'Roasting this app one feature at a time. Constructive feedback only. If I tweet it, build it.',
  },
  buildinpublic: {
    username: 'solo_hustle',
    display_name: 'Solo Hustle',
    bio: 'Young, self-employed, figuring it out. Freelancing, clients, financial freedom — the real version.',
  },
  ai_news: {
    username: 'the_ai_brief',
    display_name: 'The AI Brief',
    bio: 'What\'s happening at Anthropic, OpenAI, Google DeepMind, and everywhere else AI is moving fast.',
  },
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(auth)
  const { timingSafeEqual } = await import('crypto')
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = []

  for (const [key, profile] of Object.entries(BOT_PROFILES)) {
    const botKey = key as BotKey
    const userId = process.env[BOTS[botKey].userIdEnv]
    if (!userId) continue

    // DiceBear avatar — unique per bot, consistent every time
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${key}&backgroundColor=b6e3f4,c0aede,d1d4f9`

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: avatarUrl,
      })

    results.push({ bot: key, ok: !error, error: error?.message })
  }

  return NextResponse.json({ ok: true, results })
}
