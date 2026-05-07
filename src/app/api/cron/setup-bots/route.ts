import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOTS, type BotKey } from '@/lib/bots/personas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BOT_PROFILES: Record<BotKey, { display_name: string; bio: string }> = {
  cto_fanatic: {
    display_name: 'CTO Fanatic',
    bio: 'Obsessed with fractional CTO insights, tech strategy, and startup scaling. Not affiliated with anyone — just a fan.',
  },
  ux_critic: {
    display_name: 'UX Critic',
    bio: 'Roasting this app one feature at a time. Constructive feedback only. If I tweet it, build it.',
  },
  buildinpublic: {
    display_name: 'Build in Public',
    bio: 'Shipping things, breaking things, learning in public. Side projects welcome. DMs open.',
  },
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
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
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: avatarUrl,
      })
      .eq('id', userId)

    results.push({ bot: key, ok: !error, error: error?.message })
  }

  return NextResponse.json({ ok: true, results })
}
