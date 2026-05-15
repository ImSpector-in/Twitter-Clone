'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scanUrls } from '@/lib/utils/safeBrowsing'

const SUPABASE_STORAGE_PREFIX = 'https://ujohfqnxtmoraufztjob.supabase.co/storage/v1/object/public/'

const URL_REGEX = /https?:\/\/[^\s<>"']+/g

function validateImageUrl(url: string | undefined): string | null {
  if (!url) return null
  if (!url.startsWith(SUPABASE_STORAGE_PREFIX)) throw new Error('Invalid image URL')
  return url
}

const TENOR_CDN_PREFIXES = ['https://media.tenor.com/', 'https://c.tenor.com/']

function validateGifUrl(url: string | undefined): string | null {
  if (!url) return null
  if (!TENOR_CDN_PREFIXES.some(p => url.startsWith(p))) throw new Error('Invalid GIF URL')
  return url
}

const VALID_REPLY_SCOPES = ['everyone', 'followers', 'nobody']

function validateContent(content: string): string {
  const trimmed = content?.trim() ?? ''
  if (!trimmed) throw new Error('Tweet cannot be empty')
  if (trimmed.length > 280) throw new Error('Tweet cannot exceed 280 characters')
  return trimmed
}

function extractUrls(content: string): string[] {
  return content.match(URL_REGEX) ?? []
}

function hasIpHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  } catch {
    return false
  }
}

export async function createTweet(content: string, replyToId?: string, imageUrl?: string, replyScope?: string, gifUrl?: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validatedContent = validateContent(content)
  const validatedImageUrl = validateImageUrl(imageUrl)
  const validatedGifUrl = validateGifUrl(gifUrl)
  const validatedScope = VALID_REPLY_SCOPES.includes(replyScope ?? '') ? replyScope : 'everyone'

  // Link-specific validations
  const urls = extractUrls(validatedContent)
  if (urls.length > 0) {
    // Block links from brand-new accounts (biggest driver of spam/phishing)
    const accountAge = Date.now() - new Date(user.created_at).getTime()
    if (accountAge < 60 * 60 * 1000) {
      throw new Error('New accounts must wait 1 hour before posting links.')
    }

    // Block raw IP address links — no legitimate use case
    if (urls.some(hasIpHost)) {
      throw new Error('Links to IP addresses are not allowed.')
    }
  }

  // Q-020: DB-based rate limit — max 30 tweets per hour
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const { count } = await supabase
    .from('tweets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneHourAgo)
  if ((count ?? 0) >= 30) throw new Error('You\'re posting too fast. Please wait a while.')

  // Validate replyToId is a UUID if provided
  if (replyToId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(replyToId)) {
    throw new Error('Invalid reply target')
  }

  // Enforce reply scope server-side
  if (replyToId) {
    const { data: parentTweet } = await supabase
      .from('tweets')
      .select('user_id, reply_scope')
      .eq('id', replyToId)
      .single()

    if (!parentTweet) throw new Error('Tweet not found')

    const authorId = parentTweet.user_id
    const replyScope = parentTweet.reply_scope ?? 'everyone'

    if (replyScope === 'nobody') throw new Error('Replies are disabled on this tweet')

    if (replyScope === 'followers') {
      const { data: follow } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', authorId)
        .single()
      if (!follow && user.id !== authorId) throw new Error('Only followers can reply to this tweet')
    }

    // Block check — cannot reply if blocked in either direction
    const { data: block } = await supabase
      .from('blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${authorId}),and(blocker_id.eq.${authorId},blocked_id.eq.${user.id})`)
      .limit(1)
      .single()

    if (block) throw new Error('Cannot reply to this tweet')
  }

  const { data, error } = await supabase
    .from('tweets')
    .insert({
      content: validatedContent,
      user_id: user.id,
      reply_to_id: replyToId ?? null,
      image_url: validatedImageUrl,
      gif_url: validatedGifUrl,
      reply_scope: validatedScope,
      link_status: urls.length > 0 ? 'pending' : null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Scan URLs — use admin client since authenticated users can no longer write link_status (Q-031)
  if (urls.length > 0 && data?.id) {
    const status = await scanUrls(urls)
    const admin = createAdminClient()
    await admin.from('tweets').update({ link_status: status }).eq('id', data.id)
  }

  revalidatePath('/home')
  if (replyToId) revalidatePath(`/tweet/${replyToId}`)
}

export async function updateTweet(tweetId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validatedContent = validateContent(content)
  const urls = extractUrls(validatedContent)

  if (urls.some(hasIpHost)) throw new Error('Links to IP addresses are not allowed.')

  const { error } = await supabase
    .from('tweets')
    .update({ content: validatedContent, edited_at: new Date().toISOString() })
    .eq('id', tweetId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  // Q-033: re-scan URLs after edit so edited-in malware URLs aren't shown as clean
  const admin = createAdminClient()
  if (urls.length > 0) {
    const status = await scanUrls(urls)
    await admin.from('tweets').update({ link_status: status }).eq('id', tweetId)
  } else {
    await admin.from('tweets').update({ link_status: null }).eq('id', tweetId)
  }

  revalidatePath('/home')
  revalidatePath(`/tweet/${tweetId}`)
}

export async function deleteTweet(tweetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tweets')
    .delete()
    .eq('id', tweetId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/home')
}
