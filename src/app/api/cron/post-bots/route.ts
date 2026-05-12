import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateTweet, generateTweetWithLink, generateNewsTweet } from '@/lib/bots/gemini'
import { BOTS, type BotKey } from '@/lib/bots/personas'
import { fetchAndUploadBotImage } from '@/lib/bots/images'
import { fetchLatestAINews } from '@/lib/bots/news'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  // AI news bot: fetch a real article and generate commentary
  if (bot === 'ai_news') {
    const article = await fetchLatestAINews()
    if (!article) {
      return NextResponse.json({ error: 'No news found' }, { status: 500 })
    }

    const commentary = await generateNewsTweet(persona.systemPrompt, article.title, article.description)
    const content = `${commentary} ${article.link}`.trim().slice(0, 280)

    // 50% chance of image for news bot
    const imageUrl = Math.random() < 0.5
      ? await fetchAndUploadBotImage(persona.imageKeywords)
      : null

    const { error } = await supabase.from('tweets').insert({
      user_id: userId,
      content,
      image_url: imageUrl,
      link_status: 'clean',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, bot, article: article.title, content })
  }

  // Regular bots: decide whether this tweet includes a link (30% chance)
  const includeLink = persona.links.length > 0 && Math.random() < 0.3
  const chosenLink = includeLink
    ? persona.links[Math.floor(Math.random() * persona.links.length)]
    : null

  const topic = chosenLink?.topic
    ?? persona.topics[Math.floor(Math.random() * persona.topics.length)]

  const rawContent = chosenLink
    ? await generateTweetWithLink(persona.systemPrompt, topic)
    : await generateTweet(persona.systemPrompt, topic)

  const content = chosenLink
    ? `${rawContent} ${chosenLink.url}`.trim().slice(0, 280)
    : rawContent

  // 40% chance of attaching a relevant image
  const imageUrl = Math.random() < 0.4
    ? await fetchAndUploadBotImage(persona.imageKeywords)
    : null

  const { error } = await supabase.from('tweets').insert({
    user_id: userId,
    content,
    image_url: imageUrl,
    link_status: chosenLink ? 'clean' : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, bot, topic, content, hasImage: !!imageUrl, hasLink: !!chosenLink })
}
